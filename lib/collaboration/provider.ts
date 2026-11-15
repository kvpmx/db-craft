import * as Y from 'yjs';
import { debounce, throttle } from 'es-toolkit';
import { getFullUserName } from '../../utils/user';
import { sleep } from '../../utils';
import {
  createDiagramDocument,
  decodeUpdate,
  encodeUpdate,
  LOCAL_ORIGIN,
  readDiagram,
  REMOTE_ORIGIN,
  writeDiagram,
} from './document';

import type { RealtimeChannel, SupabaseClient, User } from '@supabase/supabase-js';
import type { Database } from '../../types/database';
import type { Position } from '../../types/diagram';
import type {
  CollaborationStatus,
  DocumentSnapshot,
  Participant,
  SharedDiagram,
} from '../../types/collaboration';

interface ProviderOptions {
  client: SupabaseClient<Database>;
  projectId: number;
  user: User;
  canEdit: boolean;
  onChange: (diagram: SharedDiagram) => void;
  onStatus: (status: CollaborationStatus) => void;
  onParticipants: (participants: Participant[]) => void;
  onSaved: (saved: boolean, timestamp?: string) => void;
  onReady: () => void;
}

const LIVE_UPDATE_INTERVAL_MS = 50;
const AUTOSAVE_DELAY_MS = 2_000;
const AUTOSAVE_MAX_WAIT_MS = 10_000;
const SAVE_RETRY_DELAY_MS = 5_000;
const MAX_RETRY_DELAY_MS = 60_000;
const MAX_SAVE_ATTEMPTS = 3;
const RECONCILE_INTERVAL_MS = 10_000;
const PARTICIPANT_COLORS = ['#2563eb', '#9333ea', '#db2777', '#d97706', '#059669', '#0891b2'];

function getParticipantColor(userId: string) {
  const hash = Array.from(userId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return PARTICIPANT_COLORS[hash % PARTICIPANT_COLORS.length]!;
}

export class DiagramProvider {
  private doc?: Y.Doc;
  private undoManager?: Y.UndoManager;
  private readonly documentChannel: RealtimeChannel;
  private readonly presenceChannel: RealtimeChannel;
  private readonly self: Participant;
  private peers = new Map<string, Participant>();
  private connected = false;
  private presenceConnected = false;
  private disposed = false;

  private revision = 0;
  private localVersion = 0;
  private savedLocalVersion = 0;
  private initialUpdates: string[] = [];
  private pendingBroadcasts: Uint8Array[] = [];
  private saving?: Promise<void>;
  private syncing?: Promise<void>;

  private maxSaveTimer?: ReturnType<typeof setTimeout>;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private recoveryTimer?: ReturnType<typeof setInterval>;
  private retryDelay = SAVE_RETRY_DELAY_MS;

  private readonly saveAfterIdle = debounce(() => this.saveInBackground(), AUTOSAVE_DELAY_MS);
  private readonly broadcastChanges = throttle(() => this.broadcast(), LIVE_UPDATE_INTERVAL_MS, {
    edges: ['trailing'],
  });
  private readonly broadcastCursor = throttle(() => this.sendCursor(), LIVE_UPDATE_INTERVAL_MS, {
    edges: ['trailing'],
  });

  constructor(private readonly options: ProviderOptions) {
    const { user, client, projectId } = options;
    this.self = {
      sessionId: crypto.randomUUID(),
      userId: user.id,
      name: getFullUserName(user) || 'Teammate',
      avatar: user.user_metadata.avatar_url || '',
      color: getParticipantColor(user.id),
      cursor: null,
    };
    this.documentChannel = client.channel(`diagram:${projectId}:document`, {
      config: { private: true, broadcast: { ack: true, self: false } },
    });
    this.presenceChannel = client.channel(`diagram:${projectId}:presence`, {
      config: { private: true, presence: { key: this.self.sessionId } },
    });
  }

  private get hasUnsavedChanges() {
    return !!this.doc && this.localVersion !== this.savedLocalVersion;
  }

  async connect() {
    this.options.onStatus('connecting');
    await this.options.client.realtime.setAuth();
    if (this.disposed) return;

    this.subscribeToDocument();
    this.subscribeToPresence();
    // Reconciliation recovers missed broadcasts, without forcing another save.
    this.recoveryTimer = setInterval(() => {
      if (this.connected) void this.sync();
    }, RECONCILE_INTERVAL_MS);
  }

  private subscribeToDocument() {
    this.documentChannel
      .on('broadcast', { event: 'update' }, ({ payload }) => {
        if (typeof payload?.update !== 'string') return;
        if (this.doc) this.applyRemote(payload.update);
        else this.initialUpdates.push(payload.update);
      })
      .on('broadcast', { event: 'persisted' }, ({ payload }) => {
        if (Number(payload?.revision) > this.revision) void this.sync();
      })
      .subscribe((status) => {
        if (this.disposed) return;
        this.connected = status === 'SUBSCRIBED';
        if (this.connected) {
          void this.sync();
        } else {
          this.options.onStatus('offline');
          this.options.onParticipants([]);
        }
      });
  }

  private subscribeToPresence() {
    this.presenceChannel
      .on('presence', { event: 'sync' }, () => this.syncPresence())
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        const peer = this.peers.get(payload?.sessionId);
        const cursor = payload?.cursor;
        if (!peer) return;
        if (cursor !== null && (!Number.isFinite(cursor?.x) || !Number.isFinite(cursor?.y))) return;
        peer.cursor = cursor;
        this.publishPeers();
      })
      .subscribe((status) => {
        if (this.disposed) return;
        this.presenceConnected = status === 'SUBSCRIBED';
        if (this.presenceConnected) {
          void this.presenceChannel.track(this.self);
        } else {
          this.peers.clear();
          this.options.onParticipants([]);
        }
      });
  }

  private syncPresence() {
    const previous = this.peers;
    const presence = Object.values(this.presenceChannel.presenceState<Participant>()).flat();
    this.peers = new Map();

    for (const entry of presence) {
      if (
        typeof entry.sessionId !== 'string' ||
        typeof entry.userId !== 'string' ||
        typeof entry.name !== 'string'
      )
        continue;
      this.peers.set(entry.sessionId, {
        sessionId: entry.sessionId,
        userId: entry.userId,
        name: entry.name.slice(0, 100),
        avatar: typeof entry.avatar === 'string' ? entry.avatar : '',
        color: getParticipantColor(entry.userId),
        cursor: previous.get(entry.sessionId)?.cursor ?? null,
      });
    }
    this.publishPeers();
  }

  private publishPeers() {
    if (this.disposed || !this.connected) return;
    this.options.onParticipants([...this.peers.values()].map((peer) => ({ ...peer })));
  }

  private applyRemote(update: string) {
    if (!this.doc || this.disposed) return;
    try {
      Y.applyUpdate(this.doc, decodeUpdate(update), REMOTE_ORIGIN);
    } catch {
      this.options.onStatus('error');
    }
  }

  private applySnapshot(snapshot: DocumentSnapshot) {
    if (snapshot.state) this.applyRemote(snapshot.state);
    // Reads and saves may finish in a different order than they started.
    this.revision = Math.max(this.revision, snapshot.revision);
  }

  private initializeDocument(snapshot: DocumentSnapshot) {
    const doc = createDiagramDocument(snapshot.baseline);
    this.doc = doc;
    this.applySnapshot(snapshot);
    this.initialUpdates.forEach((update) => this.applyRemote(update));
    this.initialUpdates = [];
    this.undoManager = new Y.UndoManager(doc.getMap('diagram'), {
      trackedOrigins: new Set([LOCAL_ORIGIN]),
    });
    doc.on('update', (update: Uint8Array, origin: unknown) => {
      if (this.disposed) return;
      if (origin !== LOCAL_ORIGIN) this.options.onChange(readDiagram(doc));
      if (origin === REMOTE_ORIGIN || !this.options.canEdit) return;

      this.localVersion++;
      this.options.onSaved(false);
      this.pendingBroadcasts.push(update);
      this.broadcastChanges();
      this.scheduleAutosave();
    });
    this.options.onChange(readDiagram(doc));
    this.options.onReady();
  }

  private sync() {
    if (this.syncing || this.disposed) return this.syncing;
    this.syncing = this.load().finally(() => {
      this.syncing = undefined;
    });
    return this.syncing;
  }

  private async load() {
    try {
      const { data: snapshot, error } = await this.options.client.rpc('open_diagram_document', {
        p_project_id: this.options.projectId,
      });
      if (error) throw error;
      if (this.disposed || !snapshot) return;

      if (this.doc) this.applySnapshot(snapshot);
      else this.initializeDocument(snapshot);

      if (snapshot.revision > 0 && !this.hasUnsavedChanges) {
        this.options.onSaved(true, snapshot.updated_at);
      }
      this.options.onStatus(this.connected ? 'live' : 'offline');
      this.publishPeers();
    } catch {
      if (!this.disposed) this.options.onStatus('error');
    }
  }

  update(before: SharedDiagram, after: SharedDiagram) {
    if (this.doc && this.options.canEdit && !this.disposed) writeDiagram(this.doc, before, after);
  }

  undo() {
    this.undoManager?.undo();
  }

  redo() {
    this.undoManager?.redo();
  }

  private broadcast() {
    if (!this.pendingBroadcasts.length || this.disposed) return;
    const update = encodeUpdate(Y.mergeUpdates(this.pendingBroadcasts));
    this.pendingBroadcasts = [];
    if (this.connected) {
      void this.documentChannel.send({ type: 'broadcast', event: 'update', payload: { update } });
    }
  }

  setCursor(cursor: Position | null) {
    this.self.cursor = cursor;
    if (cursor) {
      this.broadcastCursor();
    } else {
      this.broadcastCursor.cancel();
      this.sendCursor();
    }
  }

  private sendCursor() {
    if (!this.presenceConnected || this.disposed) return;
    void this.presenceChannel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: { sessionId: this.self.sessionId, cursor: this.self.cursor },
    });
  }

  private scheduleAutosave() {
    if (this.disposed || !this.hasUnsavedChanges || this.saving || this.retryTimer) return;
    this.saveAfterIdle();
    // The idle debounce must not postpone persistence indefinitely during a drag.
    this.maxSaveTimer ??= setTimeout(() => this.saveInBackground(), AUTOSAVE_MAX_WAIT_MS);
  }

  private cancelAutosave() {
    this.saveAfterIdle.cancel();
    clearTimeout(this.maxSaveTimer);
    this.maxSaveTimer = undefined;
  }

  private scheduleRetry() {
    this.cancelAutosave();
    this.retryTimer = setTimeout(() => {
      this.retryTimer = undefined;
      this.saveInBackground();
    }, this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 2, MAX_RETRY_DELAY_MS);
  }

  private saveInBackground() {
    if (this.saving || this.disposed || !this.hasUnsavedChanges) return;
    // Automatic saves make one pass. Only an explicit flush drains in-flight edits.
    void this.saveOnce().catch(() => {
      /* saveOnce reports the error and schedules a retry. */
    });
  }

  private saveOnce(): Promise<void> {
    if (this.saving) return this.saving;
    if (this.disposed || !this.hasUnsavedChanges) return Promise.resolve();

    this.cancelAutosave();
    this.saving = this.persist()
      .catch((error) => {
        if (!this.disposed) {
          this.options.onStatus('error');
          this.options.onSaved(false);
          this.scheduleRetry();
        }
        throw error;
      })
      .finally(() => {
        this.saving = undefined;
        // Edits received during the request wait for the next autosave window.
        if (!this.disposed && !this.retryTimer) this.scheduleAutosave();
      });
    return this.saving;
  }

  async flush(): Promise<void> {
    this.cancelAutosave();
    clearTimeout(this.retryTimer);
    this.retryTimer = undefined;
    while (this.hasUnsavedChanges && !this.disposed) {
      await this.saveOnce();
      this.cancelAutosave();
    }
  }

  private async persist() {
    const doc = this.doc;
    if (!doc) return;

    for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS && !this.disposed; attempt++) {
      const version = this.localVersion;
      const { data: snapshot, error } = await this.options.client.rpc('save_diagram_document', {
        p_project_id: this.options.projectId,
        p_revision: this.revision,
        p_state: encodeUpdate(Y.encodeStateAsUpdate(doc)),
        p_diagram: readDiagram(doc),
      });
      if (error) throw error;
      if (this.disposed) return;
      if (!snapshot) throw new Error('Missing diagram save result');
      this.applySnapshot(snapshot);

      if (snapshot.accepted) {
        this.savedLocalVersion = version;
        this.retryDelay = SAVE_RETRY_DELAY_MS;
        this.options.onSaved(!this.hasUnsavedChanges, snapshot.updated_at);
        this.options.onStatus(this.connected ? 'live' : 'offline');
        return;
      }

      // A revision conflict returns the newer CRDT. Retry after merging, with a
      // short backoff so simultaneous editors do not hammer the same document.
      if (attempt + 1 < MAX_SAVE_ATTEMPTS) await sleep(250 * 2 ** attempt);
    }
    if (!this.disposed) throw new Error('Diagram save contention');
  }

  destroy() {
    if (this.disposed) return;
    this.disposed = true;
    this.cancelAutosave();
    this.broadcastChanges.cancel();
    this.broadcastCursor.cancel();
    clearTimeout(this.retryTimer);
    clearInterval(this.recoveryTimer);
    void this.options.client.removeChannel(this.documentChannel);
    void this.options.client.removeChannel(this.presenceChannel);
    this.undoManager?.destroy();
    this.doc?.destroy();
    this.options.onParticipants([]);
    this.options.onStatus('inactive');
  }
}
