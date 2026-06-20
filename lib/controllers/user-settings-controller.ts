import { ApiController } from './api-controller';
import type { TablesUpdate } from '@/types/database';

export class UserSettingsController extends ApiController {
  async getOrCreate() {
    if (!this.user) return null;

    const { data: settings } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', this.user.id)
      .maybeSingle()
      .throwOnError();

    if (settings) return settings;

    const { data } = await this.supabase
      .from('user_settings')
      .insert({ user_id: this.user.id })
      .select()
      .single()
      .throwOnError();

    return data;
  }

  async update(payload: TablesUpdate<'user_settings'>) {
    if (!this.user) return null;

    const { data } = await this.supabase
      .from('user_settings')
      .update(payload)
      .eq('user_id', this.user.id)
      .select()
      .single()
      .throwOnError();

    return data;
  }
}
