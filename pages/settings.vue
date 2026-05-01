<script lang="ts" setup>
  import { isEqual } from 'es-toolkit/predicate';
  import { SETTINGS_TABS } from '@/features/settings/settings-tabs';
  import type { SettingsGroup, SettingsTabConfig } from '@/features/settings/settings-tabs';

  definePageMeta({ layout: 'main' });

  const { t, locale, setLocale } = useI18n();
  const { settings, updateSettings, isLoading, isSaving } = useUserSettings();

  const activeTab = ref<SettingsGroup>(SETTINGS_TABS[0].id);

  const activeTabConfig = computed<SettingsTabConfig>(() => {
    return SETTINGS_TABS.find((tab) => tab.id === activeTab.value) ?? SETTINGS_TABS[0];
  });

  const copyActiveGroupSettings = () => {
    return { ...settings.value[activeTabConfig.value.id] };
  };

  const savedActiveGroupSettings = computed(() => {
    return copyActiveGroupSettings();
  });

  const activeTabSettings = ref(copyActiveGroupSettings());

  const hasChanges = computed(() => {
    return !isEqual(activeTabSettings.value, savedActiveGroupSettings.value);
  });

  const resetActiveTabSettings = () => {
    activeTabSettings.value = { ...savedActiveGroupSettings.value };
  };

  watch(savedActiveGroupSettings, (savedSettings, previousSavedSettings) => {
    if (isEqual(activeTabSettings.value, previousSavedSettings)) {
      activeTabSettings.value = { ...savedSettings };
    }
  });

  watch(
    [() => settings.value.profile_settings.language, isLoading],
    ([language, loading]) => {
      if (!loading && language !== locale.value) {
        setLocale(language);
      }
    },
    { immediate: true }
  );

  const onTabChange = (tabId: SettingsGroup) => {
    if (tabId === activeTab.value) return;
    activeTab.value = tabId;
    resetActiveTabSettings();
  };

  const saveActiveTabSettings = async () => {
    await updateSettings({
      [activeTabConfig.value.id]: activeTabSettings.value,
    });
  };
</script>

<template>
  <PageMeta :title="t('SETTINGS')" :description="t('SETTINGS_PAGE_DESCRIPTION')" />

  <div class="mx-auto max-w-5xl space-y-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-bold text-slate-900">{{ t('SETTINGS') }}</h1>
      <p class="text-slate-600">{{ t('SETTINGS_PAGE_DESCRIPTION') }}</p>
    </div>

    <section
      class="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[220px_1fr]"
    >
      <nav
        class="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible"
        :aria-label="t('SETTINGS')"
      >
        <button
          v-for="tab in SETTINGS_TABS"
          :key="tab.id"
          type="button"
          :class="
            cn(
              'whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )
          "
          @click="onTabChange(tab.id)"
        >
          {{ t(tab.label) }}
        </button>
      </nav>

      <div class="min-w-0 space-y-6">
        <div v-if="isLoading" class="space-y-6 pt-4" :aria-label="t('SETTINGS_LOADING')">
          <div class="flex items-center gap-4">
            <Skeleton class="h-20 w-20 rounded-full" />
            <div class="space-y-2">
              <Skeleton class="h-4 w-40" />
              <Skeleton class="h-4 w-56" />
            </div>
          </div>

          <div class="space-y-2">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-10 w-full" />
          </div>

          <div class="flex justify-end border-t border-slate-200 pt-6">
            <Skeleton class="h-10 w-20" />
          </div>
        </div>

        <component
          :is="activeTabConfig.component"
          v-else
          :key="activeTabConfig.id"
          v-model="activeTabSettings"
          @submit="saveActiveTabSettings"
        >
          <template #actions>
            <p v-if="isSaving" class="text-sm text-slate-500">{{ t('SETTINGS_SAVING') }}</p>

            <Button type="submit" :disabled="!hasChanges || isSaving">
              {{ t('SAVE') }}
            </Button>
          </template>
        </component>
      </div>
    </section>
  </div>
</template>
