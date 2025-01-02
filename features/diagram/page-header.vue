<script lang="ts" setup>
  import { routes } from '@/lib/routes';
</script>

<template>
  <header class="border-b-[1px] bg-white">
    <div class="flex items-center justify-between px-3 py-2">
      <NuxtLink :to="routes.home()" class="select-none">
        <NuxtImg src="/images/logo.png" class="w-28" alt="DB Craft" />
      </NuxtLink>

      <div class="flex items-center gap-2">
        <DiagramSaveButton />
        <UserButton />
      </div>
    </div>
  </header>
</template>
