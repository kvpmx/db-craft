<script lang="ts" setup>
  import { routes } from '@/lib/routes';
  import { DATABASES } from '@/lib/constants/diagram';

  const { t } = useI18n();
  const currentProject = useCurrentProject();

  const editMode = ref(false);
  const titleValue = ref('');

  watchEffect(() => {
    if (!currentProject.state) return;
    titleValue.value = currentProject.state.name;
  });

  const databaseIcon = computed(() => {
    const currentDatabase = DATABASES.find((db) => db.value === currentProject.state?.type);
    return currentDatabase?.icon ?? '';
  });
</script>

<template>
  <header class="border-b-[1px] bg-white">
    <div class="flex items-center justify-between px-3 py-2">
      <NuxtLink :to="routes.home()" class="select-none">
        <NuxtImg src="/images/logo.png" class="w-28" alt="DB Craft" />
      </NuxtLink>

      <div
        v-if="currentProject.state"
        :class="[
          'hidden cursor-pointer select-none items-center gap-2 rounded-lg p-1 text-sm sm:flex',
          !editMode && 'hover:border-2 hover:border-blue-700/50 hover:bg-blue-200/50',
        ]"
        @dblclick="editMode = true"
      >
        <Icon :name="databaseIcon" size="1.25rem" class="h-5 w-5" />

        <template v-if="!editMode">
          {{ currentProject.state.name }}
        </template>
        <div v-else class="flex items-center gap-2">
          <Input
            v-model="titleValue"
            name="projectName"
            class="h-7 max-w-44 p-2 focus-visible:ring-transparent"
            :placeholder="t('DIAGRAM_NAME')"
          />
          <Button
            variant="outline"
            size="xs"
            class="h-7"
            :disabled="!titleValue"
            @click="
              () => {
                if (currentProject.state) {
                  currentProject.state.name = titleValue;
                }

                editMode = false;
              }
            "
          >
            <Icon name="lucide:check" size="1rem" class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <DiagramSaveButton />
        <UserButton />
      </div>
    </div>
  </header>
</template>
