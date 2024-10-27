export default defineNuxtConfig({
  compatibilityDate: '2024-10-25',
  devtools: { enabled: false },
  modules: ['@nuxt/fonts', '@nuxt/eslint', '@nuxtjs/tailwindcss', 'shadcn-nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
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
});
