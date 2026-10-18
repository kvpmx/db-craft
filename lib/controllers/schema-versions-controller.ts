import { ApiController } from './api-controller';
import { ProjectsController } from './projects-controller';
import type { Tables, TablesInsert } from '@/types/database';

export class SchemaVersionsController extends ApiController {
  private async getEditableProject(projectId: number) {
    if (!this.user) return null;

    const projectsApi = new ProjectsController(this.supabase, this.user);
    const project = await projectsApi.getById(projectId);

    if (!project) return null;

    const editable = await projectsApi.canEdit(project);
    if (!editable) return null;

    return project;
  }

  async getByProjectId(projectId: number) {
    if (!(await this.getEditableProject(projectId))) return [];

    const { data } = await this.supabase
      .from('schema_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .throwOnError();

    return data ?? [];
  }

  async create(version: Omit<TablesInsert<'schema_versions'>, 'author_id'>) {
    if (!(await this.getEditableProject(version.project_id))) return null;

    const { data } = await this.supabase
      .from('schema_versions')
      .insert({
        ...version,
        author_id: this.user!.id,
      })
      .select()
      .limit(1)
      .single()
      .throwOnError();

    return data as Tables<'schema_versions'>;
  }

  async getAuthorDisplayNames(projectId: number, userIds: string[]) {
    if (!this.user || userIds.length === 0) return [];

    if (!(await this.getEditableProject(projectId))) return [];

    const uniqueIds = [...new Set(userIds)];

    const { data: versions } = await this.supabase
      .from('schema_versions')
      .select('author_id')
      .eq('project_id', projectId)
      .in('author_id', uniqueIds)
      .throwOnError();

    const allowedIds = [...new Set(versions?.map((version) => version.author_id) ?? [])];

    if (allowedIds.length === 0) return [];

    const { data } = await this.supabase
      .rpc('get_user_display_names', { p_user_ids: allowedIds })
      .throwOnError();

    return data ?? [];
  }
}
