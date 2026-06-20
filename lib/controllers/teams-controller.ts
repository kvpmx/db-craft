import { ApiController } from './api-controller';

import type { TeamWithRole } from '@/types/team';
import type { TablesUpdate } from '@/types/database';

export class TeamsController extends ApiController {
  async getAllForUser() {
    if (!this.user) return null;

    const { data: memberships } = await this.supabase
      .from('team_members')
      .select('role, teams(*)')
      .eq('user_id', this.user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: false })
      .throwOnError();

    const toTeamWithRole = (membership: NonNullable<typeof memberships>[number] | null) => {
      const team = membership?.teams;
      if (!team) return null;

      return { ...team, role: membership.role };
    };

    return memberships?.map(toTeamWithRole).filter((team): team is TeamWithRole => Boolean(team));
  }

  async getById(id: string) {
    if (!this.user) return null;

    const { data: membership } = await this.supabase
      .from('team_members')
      .select('role, teams(*)')
      .eq('team_id', id)
      .eq('user_id', this.user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
      .throwOnError();

    if (!membership?.teams) {
      return null;
    }

    return { ...membership.teams, role: membership.role };
  }

  async create(name: string) {
    if (!this.user?.email) {
      return null;
    }

    const { data: team } = await this.supabase
      .from('teams')
      .insert({ name, created_by: this.user.id })
      .select()
      .limit(1)
      .single()
      .throwOnError();

    await this.supabase
      .from('team_members')
      .insert({
        team_id: team?.id ?? '',
        user_id: this.user.id,
        email: this.user.email.toLowerCase(),
        role: 'admin',
        status: 'active',
        joined_at: new Date().toISOString(),
      })
      .throwOnError();

    return { ...team, role: 'admin' };
  }

  async update(id: string, payload: Pick<TablesUpdate<'teams'>, 'name'>) {
    await this.supabase
      .from('teams')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .throwOnError();
  }

  async delete(id: string) {
    await this.supabase.from('teams').delete().eq('id', id).throwOnError();
  }
}
