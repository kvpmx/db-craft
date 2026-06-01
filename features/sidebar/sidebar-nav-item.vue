<script lang="ts" setup>
  import { routes } from '@/lib/routes';

  defineProps<{
    to: string;
    icon: string;
    label: string;
  }>();

  const route = useRoute();

  const isActive = (to: string) => {
    if (to === routes.home()) {
      return route.path === routes.home();
    }

    return route.path.startsWith(to);
  };
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    :class="
      isActive(to)
        ? 'bg-slate-900 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
    "
  >
    <Icon :name="icon" size="1rem" class="h-4 w-4 shrink-0" />
    <span class="truncate">{{ label }}</span>
  </NuxtLink>
</template>
