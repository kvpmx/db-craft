import { ApiController } from './api-controller';
import type { TeamMemberWithInvite, TeamRole } from '@/types/team';
import type { Enums } from '@/types/database';

const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_UNIQUE_VIOLATION = '23505';
const MAX_INVITE_CODE_ATTEMPTS = 5;

function generateInviteCode() {
  let code = '';

  for (let index = 0; index < 8; index++) {
    code += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  }

  return code;
}

type InviteSummary = Pick<TeamMemberWithInvite['invite'] & object, 'id' | 'code' | 'expires_at'>;

export class TeamMembersController extends ApiController {
  async getByTeam(teamId: string) {
    if (!this.user) return null;

    const { data: members } = await this.supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('status', { ascending: true })
      .order('joined_at', { ascending: true })
      .throwOnError();

    if (!members?.length) return [];

    const memberIds = members.map((member) => member.id);
    const inviteIds = members
      .map((member) => member.invite_id)
      .filter((inviteId): inviteId is string => Boolean(inviteId));

    const inviteById = new Map<string, InviteSummary>();
    const inviteByMemberId = new Map<string, InviteSummary>();

    if (inviteIds.length > 0) {
      const { data: invites } = await this.supabase
        .from('team_invites')
        .select('id, code, expires_at')
        .in('id', inviteIds)
        .throwOnError();

      invites?.forEach((invite) => inviteById.set(invite.id, invite));
    }

    const { data: legacyInvites } = await this.supabase
      .from('team_invites')
      .select('id, code, expires_at, team_member_id')
      .in('team_member_id', memberIds)
      .throwOnError();

    legacyInvites?.forEach((invite) => {
      if (invite.team_member_id) {
        inviteByMemberId.set(invite.team_member_id, invite);
      }
    });

    return members.map((member) => {
      const invite =
        (member.invite_id ? (inviteById.get(member.invite_id) ?? null) : null) ??
        inviteByMemberId.get(member.id) ??
        null;

      return { ...member, invite };
    });
  }

  async createInvite(teamId: string, emails: string[], role: TeamRole) {
    if (!this.user) return null;

    const userId = this.user.id;
    const normalizedEmails = [
      ...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean)),
    ];

    if (normalizedEmails.length === 0) return null;

    const { data: existingMembers } = await this.supabase
      .from('team_members')
      .select('email')
      .eq('team_id', teamId)
      .in('email', normalizedEmails)
      .throwOnError();

    const existingEmails = new Set(
      (existingMembers ?? []).map((member) => member.email?.toLowerCase()).filter(Boolean)
    );

    const newEmails = normalizedEmails.filter((email) => !existingEmails.has(email));

    if (newEmails.length === 0) {
      throw new Error('All provided emails are already invited or members of this team');
    }

    const invite = await this.insertInviteWithUniqueCode(teamId, role, userId);

    try {
      const { data: createdMembers } = await this.supabase
        .from('team_members')
        .insert(
          newEmails.map((email) => ({
            team_id: teamId,
            email,
            role,
            status: 'pending' as const,
            invited_by: userId,
            invite_id: invite.id,
          }))
        )
        .select()
        .throwOnError();

      return { members: createdMembers, invite };
    } catch (error) {
      await this.supabase.from('team_invites').delete().eq('id', invite.id);
      throw error;
    }
  }

  async updateRole(memberId: string, role: Enums<'team_role'>) {
    const { data: member } = await this.supabase
      .from('team_members')
      .select('team_id, role, status')
      .eq('id', memberId)
      .single()
      .throwOnError();

    if (member?.role === 'admin' && member.status === 'active' && role !== 'admin') {
      await this.assertTeamHasOtherAdmins(member.team_id, memberId);
    }

    await this.supabase.from('team_members').update({ role }).eq('id', memberId).throwOnError();
  }

  async remove(memberId: string) {
    const { data: member } = await this.supabase
      .from('team_members')
      .select('team_id, role, status')
      .eq('id', memberId)
      .single()
      .throwOnError();

    if (member?.role === 'admin' && member.status === 'active') {
      await this.assertTeamHasOtherAdmins(member.team_id, memberId);
    }

    await this.supabase.from('team_members').delete().eq('id', memberId).throwOnError();
  }

  async regenerateCode(inviteId: string) {
    for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt++) {
      const { data: invite, error } = await this.supabase
        .from('team_invites')
        .update({ code: generateInviteCode() })
        .eq('id', inviteId)
        .select()
        .limit(1)
        .single();

      if (!error && invite) return invite;

      if (error?.code !== INVITE_CODE_UNIQUE_VIOLATION) {
        throw error ?? new Error('Failed to regenerate invite code');
      }
    }

    throw new Error('Failed to generate unique invite code');
  }

  private async insertInviteWithUniqueCode(teamId: string, role: TeamRole, userId: string) {
    for (let attempt = 0; attempt < MAX_INVITE_CODE_ATTEMPTS; attempt++) {
      const { data: invite, error } = await this.supabase
        .from('team_invites')
        .insert({
          team_id: teamId,
          role,
          code: generateInviteCode(),
          invited_by: userId,
        })
        .select()
        .limit(1)
        .single();

      if (!error && invite) return invite;

      if (error?.code !== INVITE_CODE_UNIQUE_VIOLATION) {
        throw error ?? new Error('Failed to create invite');
      }
    }

    throw new Error('Failed to generate unique invite code');
  }

  private async assertTeamHasOtherAdmins(teamId: string, excludeMemberId: string) {
    const { count, error } = await this.supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('role', 'admin')
      .eq('status', 'active')
      .neq('id', excludeMemberId);

    if (error) throw error;

    if (!count) {
      throw new Error('Cannot remove or demote the last admin');
    }
  }
}
