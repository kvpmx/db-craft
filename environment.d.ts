declare const process: NodeJS.Process & {
  env: {
    NODE_ENV: 'development' | 'production';
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    NUXT_PUBLIC_SITE_URL: string;
    GROQ_API_KEY: string;
  };
};
