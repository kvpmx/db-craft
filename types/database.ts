import type { DiagramConfig } from './diagram';
import type { ProfileSettings, DiagramSettings } from './user-settings';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      projects: {
        Row: {
          author: string;
          created_at: string;
          id: number;
          last_modified_at: string;
          name: string;
          schema: DiagramConfig;
          share_id: string;
          team_id: string | null;
          type: Database['public']['Enums']['database_type'];
          visibility: Database['public']['Enums']['diagram_visibility'];
        };
        Insert: {
          author: string;
          created_at?: string;
          id?: number;
          last_modified_at?: string;
          name?: string;
          schema?: DiagramConfig;
          share_id?: string;
          team_id?: string | null;
          type?: Database['public']['Enums']['database_type'];
          visibility?: Database['public']['Enums']['diagram_visibility'];
        };
        Update: {
          author?: string;
          created_at?: string;
          id?: number;
          last_modified_at?: string;
          name?: string;
          schema?: DiagramConfig;
          share_id?: string;
          team_id?: string | null;
          type?: Database['public']['Enums']['database_type'];
          visibility?: Database['public']['Enums']['diagram_visibility'];
        };
        Relationships: [
          {
            foreignKeyName: 'projects_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      schema_versions: {
        Row: {
          author_id: string;
          created_at: string;
          id: string;
          message: string;
          project_id: number;
          schema: DiagramConfig;
        };
        Insert: {
          author_id: string;
          created_at?: string;
          id?: string;
          message: string;
          project_id: number;
          schema: DiagramConfig;
        };
        Update: {
          author_id?: string;
          created_at?: string;
          id?: string;
          message?: string;
          project_id?: number;
          schema?: DiagramConfig;
        };
        Relationships: [
          {
            foreignKeyName: 'schema_versions_project_id_fkey';
            columns: ['project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          },
        ];
      };
      team_invites: {
        Row: {
          code: string;
          created_at: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          role: Database['public']['Enums']['team_role'] | null;
          team_id: string;
          team_member_id: string | null;
          token: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          role?: Database['public']['Enums']['team_role'] | null;
          team_id: string;
          team_member_id?: string | null;
          token?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          role?: Database['public']['Enums']['team_role'] | null;
          team_id?: string;
          team_member_id?: string | null;
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_invites_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_invites_team_member_id_fkey';
            columns: ['team_member_id'];
            isOneToOne: false;
            referencedRelation: 'team_members';
            referencedColumns: ['id'];
          },
        ];
      };
      team_members: {
        Row: {
          email: string | null;
          id: string;
          invite_id: string | null;
          invited_at: string;
          invited_by: string | null;
          joined_at: string | null;
          role: Database['public']['Enums']['team_role'];
          status: Database['public']['Enums']['team_member_status'];
          team_id: string;
          user_id: string | null;
        };
        Insert: {
          email?: string | null;
          id?: string;
          invite_id?: string | null;
          invited_at?: string;
          invited_by?: string | null;
          joined_at?: string | null;
          role?: Database['public']['Enums']['team_role'];
          status?: Database['public']['Enums']['team_member_status'];
          team_id: string;
          user_id?: string | null;
        };
        Update: {
          email?: string | null;
          id?: string;
          invite_id?: string | null;
          invited_at?: string;
          invited_by?: string | null;
          joined_at?: string | null;
          role?: Database['public']['Enums']['team_role'];
          status?: Database['public']['Enums']['team_member_status'];
          team_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_invite_id_fkey';
            columns: ['invite_id'];
            isOneToOne: false;
            referencedRelation: 'team_invites';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_members_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          diagram_settings: DiagramSettings;
          profile_settings: ProfileSettings;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          diagram_settings?: DiagramSettings;
          profile_settings?: ProfileSettings;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          diagram_settings?: DiagramSettings;
          profile_settings?: ProfileSettings;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      accept_team_invite: { Args: { p_token: string }; Returns: string };
      accept_team_invite_by_code: { Args: { p_code: string }; Returns: string };
      auth_user_email: { Args: never; Returns: string };
      can_edit_team_project: {
        Args: { p_team_id: string; p_user_id: string };
        Returns: boolean;
      };
      generate_invite_code: { Args: never; Returns: string };
      get_team_invite_by_code: { Args: { p_code: string }; Returns: Json };
      get_team_invite_info: { Args: { p_token: string }; Returns: Json };
      get_user_display_names: {
        Args: { p_user_ids: string[] };
        Returns: { display_name: string; id: string }[];
      };
      is_team_admin: {
        Args: { p_team_id: string; p_user_id: string };
        Returns: boolean;
      };
      is_team_member: {
        Args: { p_team_id: string; p_user_id: string };
        Returns: boolean;
      };
      team_role: {
        Args: { p_team_id: string; p_user_id: string };
        Returns: Database['public']['Enums']['team_role'];
      };
    };
    Enums: {
      database_type: 'mysql' | 'postgres' | 'sqlserver' | 'sqlite' | 'mariadb' | 'oracle';
      diagram_visibility: 'public' | 'private';
      team_member_status: 'pending' | 'active';
      team_role: 'admin' | 'editor' | 'viewer';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      database_type: ['mysql', 'postgres', 'sqlserver', 'sqlite', 'mariadb', 'oracle'],
      diagram_visibility: ['public', 'private'],
      team_member_status: ['pending', 'active'],
      team_role: ['admin', 'editor', 'viewer'],
    },
  },
} as const;
