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
    '@nuxtjs/i18n',
  ],
  components: [
    { path: '@/features', pathPrefix: true },
    { path: '@/features/common', pathPrefix: false },
  ],
  image: {
    provider: 'none',
  },
  ogImage: {
    componentDirs: ['@/features/common'],
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
  i18n: {
    defaultLocale: 'en',
    restructureDir: './lib/i18n',
    langDir: '../../assets/locales',
    strategy: 'no_prefix',
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'uk', file: 'uk.json' },
    ],
    experimental: {
      localeDetector: 'locale-detector.ts',
      typedOptionsAndMessages: 'default',
    },
  },
});
