<script lang="ts" setup>
  import { routes } from '@/lib/routes';
</script>

<template>
  <header class="sticky top-0 z-10 bg-white shadow">
    <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <NuxtLink :to="routes.home()" class="select-none">
        <NuxtImg src="/images/logo.png" class="w-40" alt="DB Craft" />
      </NuxtLink>

      <UserButton />
    </div>
  </header>
</template>
