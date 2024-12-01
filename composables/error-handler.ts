import { toast } from 'vue-sonner';
import type { AuthError } from '@supabase/auth-js';

export const useAuthErrorHandler = () => {
  const withAuthError = async (promise: Promise<{ error: AuthError | null }>) => {
    const { error } = await promise;

    if (!error) return true;

    toast.error(error.toString());
    return false;
  };

  return { withAuthError };
};
