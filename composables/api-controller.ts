import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { ApiController } from '@/lib/controllers';
import type { Database } from '@/types/database.types';

interface ApiControllerConstructor<T extends ApiController> {
  new (supabaseClient: SupabaseClient<Database>, user: User | null): T;
}

export const useApiController = <T extends ApiController>(
  ControllerContructor: ApiControllerConstructor<T>
) => {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();

  return reactive(new ControllerContructor(supabase, user));
};
