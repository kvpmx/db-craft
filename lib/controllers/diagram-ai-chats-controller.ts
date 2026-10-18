import { ApiController } from './api-controller';
import { ProjectsController } from './projects-controller';

import type { StoredAiChatMessage, ProposalStates } from '@/types/ai-chat';
import type { Tables, TablesInsert } from '@/types/database';

export class DiagramAiChatsController extends ApiController {
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
    if (!this.user) return null;

    const project = await this.getEditableProject(projectId);

    if (!project) return null;

    const { data } = await this.supabase
      .from('diagram_ai_chats')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', this.user.id)
      .limit(1)
      .maybeSingle()
      .throwOnError();

    return data as Tables<'diagram_ai_chats'> | null;
  }

  async upsert(
    projectId: number,
    messages: StoredAiChatMessage[],
    proposalStates: ProposalStates = {}
  ) {
    if (!this.user) return null;

    const project = await this.getEditableProject(projectId);

    if (!project) return null;

    const payload: Omit<TablesInsert<'diagram_ai_chats'>, 'user_id'> = {
      project_id: projectId,
      messages,
      proposal_states: proposalStates,
      updated_at: new Date().toISOString(),
    };

    const { data } = await this.supabase
      .from('diagram_ai_chats')
      .upsert(
        {
          ...payload,
          user_id: this.user.id,
        },
        { onConflict: 'project_id,user_id' }
      )
      .select()
      .limit(1)
      .single()
      .throwOnError();

    return data as Tables<'diagram_ai_chats'>;
  }

  async clear(projectId: number) {
    return this.upsert(projectId, [], {});
  }
}
