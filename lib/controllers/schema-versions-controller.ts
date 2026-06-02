import { ApiController } from './api-controller';
import type { Tables, TablesInsert } from '@/types/database';

export class SchemaVersionsController extends ApiController {
  async getByProjectId(projectId: number) {
    if (!this.user) return [];

    const { data } = await this.supabase
      .from('schema_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .throwOnError();

    return data ?? [];
  }

  async create(version: Omit<TablesInsert<'schema_versions'>, 'author_id'>) {
    if (!this.user) return null;

    const { data } = await this.supabase
      .from('schema_versions')
      .insert({
        ...version,
        author_id: this.user.id,
      })
      .select()
      .limit(1)
      .single()
      .throwOnError();

    return data as Tables<'schema_versions'>;
  }

  async getAuthorDisplayNames(userIds: string[]) {
    if (!this.user || userIds.length === 0) return [];

    const uniqueIds = [...new Set(userIds)];

    const { data } = await this.supabase
      .rpc('get_user_display_names', { p_user_ids: uniqueIds })
      .throwOnError();

    return data ?? [];
  }
}
