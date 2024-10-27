declare const process: NodeJS.Process & {
  env: {
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
  };
};
