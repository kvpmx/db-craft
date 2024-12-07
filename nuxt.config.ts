export default defineNuxtConfig({
  compatibilityDate: '2024-10-25',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  modules: [
    '@nuxt/fonts',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@vee-validate/nuxt',
    '@nuxtjs/supabase',
    'nuxt-og-image',
    '@hebilicious/vue-query-nuxt',
  ],
  components: [
    {
      path: '@/features',
      pathPrefix: false,
    },
  ],
  image: {
    dir: 'assets/images',
  },
  shadcn: {
    prefix: '',
    componentDir: './components',
  },
  fonts: {
    families: [
      {
        name: 'Montserrat',
        provider: 'google',
        display: 'swap',
        subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
      },
    ],
  },
  veeValidate: {
    autoImports: true,
    componentNames: {
      Form: 'VeeForm',
      Field: 'VeeField',
      FieldArray: 'VeeFieldArray',
      ErrorMessage: 'VeeErrorMessage',
    },
  },
  supabase: {
    types: '@/types/database.ts',
  },
});
