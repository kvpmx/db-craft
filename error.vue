<script lang="ts" setup>
  import { routes } from './lib/routes';
  import type { NuxtError } from 'nuxt/app';

  defineProps<{ error: NuxtError }>();

  const { t } = useI18n();
  const isDevMode = import.meta.dev;
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white px-6 py-12"
  >
    <!-- Background pattern -->
    <svg
      class="absolute inset-0 h-full w-full text-red-100 opacity-20 blur-sm"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <pattern
          id="pattern"
          x="30"
          y="30"
          width="100"
          height="100"
          viewBox="0 0 40 40"
          patternUnits="userSpaceOnUse"
        >
          <path fill="red" d="M11.001 10h2v5h-2zM11 16h2v2h-2z" />
          <path
            fill="red"
            d="M13.768 4.2C13.42 3.545 12.742 3.138 12 3.138s-1.42.407-1.768 1.063L2.894 18.064a1.99 1.99 0 0 0 .054 1.968A1.98 1.98 0 0 0 4.661 21h14.678c.708 0 1.349-.362 1.714-.968a1.99 1.99 0 0 0 .054-1.968zM4.661 19L12 5.137L19.344 19z"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#pattern)" />
    </svg>

    <div
      class="relative z-10 w-full max-w-xl rounded-2xl border-2 border-slate-100 bg-white px-10 py-20 text-center shadow-lg"
    >
      <div class="mb-6">
        <h1 class="mb-4 font-serif text-5xl text-gray-800">
          {{ error.statusCode === 404 ? t('PAGE_NOT_FOUND') : t('SOMETHING_WENT_WRONG') }}
        </h1>
        <p class="mt-2 text-xl italic text-gray-500">
          {{
            error.statusCode === 404
              ? t('PAGE_NOT_FOUND_DESCRIPTION')
              : isDevMode
                ? error.message
                : t('UNEXPECTED_ERROR')
          }}
        </p>
      </div>

      <NuxtLink
        :to="routes.home()"
        class="mt-6 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-6 py-2 text-red-600 transition-all duration-200 hover:border-red-400 hover:text-red-700"
      >
        <Icon name="lucide:arrow-left" size="1rem" class="h-4 w-4" /> {{ t('GO_BACK_HOME') }}
      </NuxtLink>
    </div>
  </div>
</template>
