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
}
