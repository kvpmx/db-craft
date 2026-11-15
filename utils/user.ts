import { compact } from 'es-toolkit';
import type { User } from '@supabase/supabase-js';

/**
 * Get the full username.
 *
 * @param user - A user object that contains user metadata.
 * @returns Full name of the user.
 */
export const getFullUserName = (user: User | null | undefined): string => {
  if (!user) return '';

  const { full_name, first_name, last_name } = user.user_metadata;

  if (full_name) return full_name;
  if (first_name || last_name) return compact([first_name, last_name]).join(' ');
  return user.email?.split('@')[0] || '';
};
