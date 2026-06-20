<script lang="ts" setup>
  import { routes } from '@/lib/routes';

  const { t } = useI18n();
</script>

<template>
  <aside
    class="sticky top-[70px] flex h-[calc(100vh-70px)] w-full shrink-0 flex-col overflow-y-auto border-r border-slate-200/70 bg-white md:w-60 lg:w-72"
  >
    <nav class="flex flex-col gap-6 p-4 pt-6" :aria-label="t('NAVIGATION')">
      <div class="space-y-0.5">
        <SidebarNavItem :to="routes.home()" icon="lucide:folder" :label="t('PROJECTS')" />
        <SidebarNavItem :to="routes.joinTeam()" icon="lucide:ticket" :label="t('JOIN_TEAM')" />
      </div>

      <div class="border-t border-slate-100 pt-6">
        <SidebarTeamsList />
      </div>
    </nav>
  </aside>
</template>
