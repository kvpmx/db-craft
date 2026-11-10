<script setup lang="ts">
  import { routes } from '@/lib/routes';
  const { t } = useI18n();
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-[url(/images/auth-background.webp)] bg-cover bg-center px-4 py-12 sm:px-6 lg:px-8"
  >
    <NuxtLink
      :to="routes.tutorial()"
      class="absolute right-6 top-6 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
    >
      {{ t('TUTORIAL') }}
    </NuxtLink>
    <slot />
  </main>
</template>
