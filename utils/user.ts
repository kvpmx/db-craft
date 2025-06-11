import type { User } from '@supabase/supabase-js';

/**
 * Get the full username.
 *
 * @param user - A user object that contains user metadata.
 * @returns Full name of the user.
 */
export const getFullUserName = (user: User) => {
  const { full_name, first_name, last_name } = user.user_metadata;
  return full_name || `${first_name} ${last_name}`;
};
