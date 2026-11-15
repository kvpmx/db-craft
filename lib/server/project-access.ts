import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database, Tables } from '@/types/database';

export const getAccessibleProject = async (
  supabase: SupabaseClient<Database>,
  user: User,
  projectId: number
): Promise<Tables<'projects'> | null> => {
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .limit(1)
    .maybeSingle()
    .throwOnError();

  if (!data) return null;

  if (data.author === user.id) return data;

  if (data.team_id) {
    const { data: membership } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', data.team_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
      .throwOnError();

    if (membership) return data;
  }

  return null;
};

export const canEditProject = async (
  supabase: SupabaseClient<Database>,
  user: User,
  project: Tables<'projects'>
) => {
  if (project.author === user.id) return true;

  if (!project.team_id) return false;

  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', project.team_id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()
    .throwOnError();

  return membership?.role === 'admin' || membership?.role === 'editor';
};
