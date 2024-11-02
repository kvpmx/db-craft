declare const process: NodeJS.Process & {
  env: {
    NODE_ENV: 'development' | 'production';
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
  };
};
