import type { MergeDeep } from 'type-fest';
import type { Database as DatabaseGenerated } from './supabase';
import type { DiagramConfig } from './diagram';

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        projects: {
          Row: {
            schema: DiagramConfig;
          };
          Insert: {
            schema?: DiagramConfig;
          };
          Update: {
            schema?: DiagramConfig;
          };
        };
      };
    };
  }
>;
