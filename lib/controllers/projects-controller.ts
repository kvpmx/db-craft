import { toBlob } from 'html-to-image';
import { ApiController } from './api-controller';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

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
    await this.supabase
      .from('projects')
      .insert({
        ...project,
        id: undefined,
        created_at: undefined,
        last_modified_at: undefined,
        name: `${project.name} (Copy)`,
      })
      .throwOnError();
  }

  async update(id: number, payload: TablesUpdate<'projects'>) {
    await this.supabase.from('projects').update(payload).eq('id', id).throwOnError();
  }

  getThumbnailPath(project: Pick<Tables<'projects'>, 'id' | 'team_id' | 'author'>) {
    const prefix = project.team_id ?? project.author;
    return `${prefix}/${project.id}.png`;
  }

  private getLegacyThumbnailPath(project: Pick<Tables<'projects'>, 'id' | 'author'>) {
    return `${project.author}/${project.id}.png`;
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
