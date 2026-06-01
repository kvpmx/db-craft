import { ApiController } from './api-controller';
import type { TeamInvitePreview } from '@/types/team';

export class TeamInvitesController extends ApiController {
  async getByCode(code: string) {
    const { data } = await this.supabase.rpc('get_team_invite_by_code', {
      p_code: code.trim(),
    });

    return data as TeamInvitePreview | null;
  }

  async accept(code: string) {
    if (!this.user) return null;

    const { data: teamId, error } = await this.supabase.rpc('accept_team_invite_by_code', {
      p_code: code.trim(),
    });

    if (error) throw error;

    return teamId;
  }
}
