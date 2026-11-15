import * as Y from 'yjs';
import { toBlob } from 'html-to-image';
import { ApiController } from './api-controller';
import {
  createDiagramDocument,
  decodeUpdate,
  encodeUpdate,
  readDiagram,
  REMOTE_ORIGIN,
  writeDiagram,
} from '@/lib/collaboration/document';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';
import type { DiagramConfig } from '@/types/diagram';
import type { SharedDiagram } from '@/types/collaboration';

const SHARED_DIAGRAM_SAVE_ATTEMPTS = 3;

export class ProjectsController extends ApiController {
  async getAll() {
    if (!this.user) return null;

    const { data } = await this.supabase
      .from('projects')
      .select('*')
      .eq('author', this.user.id)
      .order('created_at', { ascending: false })
      .throwOnError();

    return data;
  }

  async getPersonal() {
    if (!this.user) return null;

    const { data } = await this.supabase
      .from('projects')
      .select('*')
      .eq('author', this.user.id)
      .is('team_id', null)
      .order('created_at', { ascending: false })
      .throwOnError();

    return data;
  }

  async getByTeam(teamId: string) {
    if (!this.user) return null;

    const { data } = await this.supabase
      .from('projects')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .throwOnError();

    return data;
  }

  async getById(id: number | string) {
    if (!this.user) return null;

    const { data } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .limit(1)
      .maybeSingle()
      .throwOnError();

    if (!data) return null;

    if (data.author === this.user.id) return data;

    if (data.team_id) {
      const { data: membership } = await this.supabase
        .from('team_members')
        .select('id')
        .eq('team_id', data.team_id)
        .eq('user_id', this.user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle()
        .throwOnError();

      if (membership) return data;
    }

    return null;
  }

  async canEdit(project: Tables<'projects'>) {
    if (!this.user) return false;

    if (project.team_id === null) {
      return project.author === this.user.id;
    }

    const { data: membership } = await this.supabase
      .from('team_members')
      .select('role')
      .eq('team_id', project.team_id)
      .eq('user_id', this.user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
      .throwOnError();

    return membership?.role === 'admin' || membership?.role === 'editor';
  }

  async getPublic(uuid: string) {
    const { data } = await this.supabase
      .from('projects')
      .select('*')
      .eq('share_id', uuid)
      .eq('visibility', 'public')
      .limit(1)
      .maybeSingle()
      .throwOnError();

    return data;
  }

  async create(newProject: Omit<TablesInsert<'projects'>, 'author'>) {
    if (!this.user) return;

    const { data } = await this.supabase
      .from('projects')
      .insert({ ...newProject, author: this.user.id })
      .select()
      .limit(1)
      .single()
      .throwOnError();

    return data;
  }

  async delete(id: number) {
    await this.supabase.from('projects').delete().eq('id', id).throwOnError();
  }

  async duplicate(project: TablesInsert<'projects'>) {
    const { data: copy } = await this.supabase
      .from('projects')
      .insert({
        ...project,
        id: undefined,
        created_at: undefined,
        last_modified_at: undefined,
        share_id: undefined,
        name: `${project.name} (Copy)`,
      })
      .select()
      .limit(1)
      .single()
      .throwOnError();

    if (copy && project.id != null && project.author) {
      await this.copyThumbnail(
        {
          id: project.id,
          team_id: project.team_id ?? null,
          author: project.author,
        },
        copy
      );
    }
  }

  async update(id: number, payload: TablesUpdate<'projects'>) {
    await this.supabase.from('projects').update(payload).eq('id', id).throwOnError();
  }

  async updateDetails(
    project: Pick<Tables<'projects'>, 'id' | 'team_id'>,
    details: Pick<Tables<'projects'>, 'name' | 'visibility' | 'type'>,
    migrateSchema?: (schema: DiagramConfig) => DiagramConfig
  ) {
    const { type, ...shared } = details;

    if (!project.team_id) {
      const payload: TablesUpdate<'projects'> = {
        ...shared,
        type,
        last_modified_at: new Date().toISOString(),
      };

      if (migrateSchema) {
        const current = await this.getById(project.id);
        if (!current) throw new Error('Project not found');
        payload.schema = migrateSchema(current.schema);
      }

      await this.update(project.id, payload);
      return;
    }

    // Team diagrams are served from the collaborative document, so name,
    // visibility and schema must be merged into it rather than into the row.
    await this.updateSharedDiagram(project.id, (diagram) => ({
      ...diagram,
      ...shared,
      schema: migrateSchema ? migrateSchema(diagram.schema) : diagram.schema,
    }));
    await this.update(project.id, { type });
  }

  private async updateSharedDiagram(
    projectId: number,
    change: (diagram: SharedDiagram) => SharedDiagram
  ) {
    for (let attempt = 0; attempt < SHARED_DIAGRAM_SAVE_ATTEMPTS; attempt++) {
      const { data: snapshot } = await this.supabase
        .rpc('open_diagram_document', { p_project_id: projectId })
        .throwOnError();

      if (!snapshot) throw new Error('Missing diagram document');

      const doc = createDiagramDocument(snapshot.baseline);

      try {
        if (snapshot.state) Y.applyUpdate(doc, decodeUpdate(snapshot.state), REMOTE_ORIGIN);

        const before = readDiagram(doc);
        writeDiagram(doc, before, change(before));

        const { data: result } = await this.supabase
          .rpc('save_diagram_document', {
            p_project_id: projectId,
            p_revision: snapshot.revision,
            p_state: encodeUpdate(Y.encodeStateAsUpdate(doc)),
            p_diagram: readDiagram(doc),
          })
          .throwOnError();

        if (!result) throw new Error('Missing diagram save result');
        if (result.accepted) return;
      } finally {
        doc.destroy();
      }
    }

    throw new Error('Diagram save contention');
  }

  getThumbnailPath(project: Pick<Tables<'projects'>, 'id' | 'team_id' | 'author'>) {
    const prefix = project.team_id ?? project.author;
    return `${prefix}/${project.id}.png`;
  }

  private getLegacyThumbnailPath(project: Pick<Tables<'projects'>, 'id' | 'author'>) {
    return `${project.author}/${project.id}.png`;
  }

  private async copyThumbnail(
    source: Pick<Tables<'projects'>, 'id' | 'team_id' | 'author'>,
    target: Pick<Tables<'projects'>, 'id' | 'team_id' | 'author'>
  ) {
    const sourcePaths = [this.getThumbnailPath(source)];

    if (source.team_id) {
      sourcePaths.push(this.getLegacyThumbnailPath(source));
    }

    for (const path of sourcePaths) {
      const { data, error } = await this.supabase.storage.from('thumbnails').download(path);

      if (error || !data) continue;

      const { error: uploadError } = await this.supabase.storage
        .from('thumbnails')
        .upload(this.getThumbnailPath(target), data, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;
      return;
    }
  }

  async getThumbnailUrl(
    project: Pick<Tables<'projects'>, 'id' | 'team_id' | 'author'> | undefined
  ) {
    if (!project?.id || !this.user) return null;

    const paths = [this.getThumbnailPath(project)];

    if (project.team_id) {
      paths.push(this.getLegacyThumbnailPath(project));
    }

    for (const path of paths) {
      const { data, error } = await this.supabase.storage
        .from('thumbnails')
        .createSignedUrl(path, 24 * 60 * 60);

      if (!error && data?.signedUrl) {
        return data.signedUrl;
      }
    }

    return null;
  }

  async updateThumbnail(
    project: Pick<Tables<'projects'>, 'id' | 'team_id' | 'author'> | null,
    canvasRef: HTMLDivElement | null
  ) {
    if (!canvasRef || !project?.id || !this.user) return;

    const width = 600;
    const ratio = canvasRef.clientHeight / canvasRef.clientWidth;

    const imageBlob = await toBlob(canvasRef, {
      type: 'image/png',
      canvasWidth: width,
      canvasHeight: ratio * width,
      filter: (node) => {
        return !(
          node?.classList?.contains('diagram-collaboration-cursors') ||
          node?.classList?.contains('vue-flow__minimap') ||
          node?.classList?.contains('vue-flow__controls') ||
          node?.classList?.contains('vue-flow__background')
        );
      },
    });

    if (!imageBlob) return;

    const fileName = `${project.id}.png`;
    const file = new File([imageBlob], fileName, {
      type: 'image/png',
      lastModified: Date.now(),
    });

    const { error } = await this.supabase.storage
      .from('thumbnails')
      .upload(this.getThumbnailPath(project), file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) throw error;
  }
}
