export default defineNuxtConfig({
  compatibilityDate: '2024-10-25',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss', 'shadcn-nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
});
