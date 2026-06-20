import type { Enums, Tables } from './database';

export type TeamRole = Enums<'team_role'>;
export type TeamMemberStatus = Enums<'team_member_status'>;

export type Team = Tables<'teams'>;
export type TeamMember = Tables<'team_members'>;
export type TeamInvite = Tables<'team_invites'>;

export interface TeamWithRole extends Team {
  role: TeamRole;
}

export interface TeamInvitePreview {
  team_name: string | null;
  team_id: string | null;
  role: TeamRole | null;
  expires_at: string | null;
  valid: boolean;
  email_matches: boolean | null;
}

export interface TeamMemberWithInvite extends TeamMember {
  invite: Pick<TeamInvite, 'id' | 'code' | 'expires_at'> | null;
}

export const TEAM_ROLES: TeamRole[] = ['admin', 'editor', 'viewer'];
