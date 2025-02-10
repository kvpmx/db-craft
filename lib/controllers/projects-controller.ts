import { toBlob } from 'html-to-image';
import { ApiController } from './api-controller';
import type { TablesInsert, TablesUpdate } from '@/types/database';

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

  async getById(id: number | string) {
    if (!this.user) return null;

    const { data } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('author', this.user.id)
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

  async getThumbnailUrl(projectId: number | undefined) {
    if (!projectId || !this.user) return null;

    const { data } = await this.supabase.storage
      .from('thumbnails')
      .createSignedUrl(`${this.user.id}/${projectId}.png`, 24 * 60 * 60);

    return data?.signedUrl ?? null;
  }

  async updateThumbnail(projectId: number | undefined, canvasRef: HTMLDivElement | null) {
    if (!canvasRef || !projectId || !this.user) return;

    const width = 600;
    const ratio = canvasRef.clientHeight / canvasRef.clientWidth;

    // TODO: fit view to all nodes before taking the screenshot
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
    const file = new File([imageBlob], `${projectId}.png`, {
      type: 'image/png',
      lastModified: Date.now(),
    });

    if (file) {
      await this.supabase.storage.from('thumbnails').upload(`${this.user.id}/${file.name}`, file, {
        cacheControl: '3600',
        upsert: true,
      });
    }
  }
}
