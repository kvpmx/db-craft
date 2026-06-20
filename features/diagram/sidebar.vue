<script lang="ts" setup>
  import {
    DIAGRAM_SIDEBAR_TABS,
    SIDEBAR_TOOLBAR_WIDTH,
    SIDEBAR_WIDTH,
  } from '@/features/diagram/sidebar-tabs';

  import type { DiagramSidebarTab } from '@/features/diagram/sidebar-tabs';

  defineProps<{ pending: boolean }>();

  const { t } = useI18n();

  const sidebarHidden = ref(false);
  const activeTab = ref<DiagramSidebarTab>(DIAGRAM_SIDEBAR_TABS[0].id);

  const activeTabConfig = computed(() => {
    return (
      DIAGRAM_SIDEBAR_TABS.find((tab) => tab.id === activeTab.value) ?? DIAGRAM_SIDEBAR_TABS[0]
    );
  });

  const sidebarOffset = computed(() => {
    return sidebarHidden.value ? `-${SIDEBAR_WIDTH}px` : '0';
  });
</script>

<template>
  <aside
    class="relative flex border-r transition-all"
    :style="{ width: `${SIDEBAR_WIDTH}px`, marginLeft: sidebarOffset }"
  >
    <nav
      class="flex shrink-0 flex-col border-r bg-slate-50"
      :style="{ width: `${SIDEBAR_TOOLBAR_WIDTH}px` }"
      :aria-label="t('DIAGRAM_SIDEBAR')"
    >
      <button
        v-for="tab in DIAGRAM_SIDEBAR_TABS"
        :key="tab.id"
        type="button"
        :class="
          cn(
            'flex h-[calc(2.75rem+1px)] w-full items-center justify-center border-b border-slate-200 transition-colors',
            activeTab === tab.id
              ? 'bg-white text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          )
        "
        :title="t(tab.labelKey)"
        :aria-current="activeTab === tab.id ? 'page' : undefined"
        @click="activeTab = tab.id"
      >
        <Icon :name="tab.icon" size="1rem" class="h-4 w-4" />
      </button>
    </nav>

    <div class="flex min-w-0 flex-1 flex-col">
      <component :is="activeTabConfig.component" :pending="pending" />
    </div>

    <Button
      variant="outline"
      size="xs"
      class="absolute -right-10 top-2 z-10 px-1.5"
      @click="sidebarHidden = !sidebarHidden"
    >
      <Icon
        :name="sidebarHidden ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
        size="1rem"
        class="h-4 w-4"
      />
    </Button>
  </aside>
</template>
