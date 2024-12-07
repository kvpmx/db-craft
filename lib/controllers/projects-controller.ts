import { ApiController } from './api-controller';
import type { TablesInsert } from '@/types/database';

export class ProjectsController extends ApiController {
  async getAll() {
    if (!this.user) return;

    const { data } = await this.supabase
      .from('projects')
      .select('*')
      .eq('author', this.user.id)
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
}
