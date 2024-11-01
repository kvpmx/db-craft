import { useToast } from '@/components/ui/toast/use-toast';
import type { AuthTokenResponse } from '@supabase/auth-js';

export const useAuthErrorHandler = () => {
  const { toast } = useToast();

  const withAuthError = async (promise: Promise<AuthTokenResponse>) => {
    const { error } = await promise;

    if (!error) return true;

    toast({ title: error.message, variant: 'error' });
    return false;
  };

  return { withAuthError };
};
