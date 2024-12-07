import type { Database } from '@/types/database';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export abstract class ApiController {
  protected supabase: SupabaseClient<Database>;
  protected user: User | null;

  constructor(supabaseClient: SupabaseClient<Database>, user: User | null = null) {
    this.supabase = supabaseClient;
    this.user = user;
  }
}
