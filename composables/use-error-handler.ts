import { useToast } from '@/components/toast/use-toast';
import type { AuthError } from '@supabase/auth-js';

export const useAuthErrorHandler = () => {
  const { toast } = useToast();

  const withAuthError = async (promise: Promise<{ error: AuthError | null }>) => {
    const { error } = await promise;

    if (!error) return true;

    toast({ title: error.message, variant: 'error' });
    return false;
  };

  return { withAuthError };
};
