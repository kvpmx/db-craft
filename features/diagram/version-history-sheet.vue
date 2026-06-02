<script lang="ts" setup>
  import { cloneDeep } from 'es-toolkit';
  import { format } from 'date-fns';
  import { SchemaVersionsController } from '@/lib/controllers';

  import type { Tables } from '@/types/database';

  const { t } = useI18n();
  const currentProject = useCurrentProject();
  const schemaVersionsApi = useApiController(SchemaVersionsController);
  const queryClient = useQueryClient();

  const open = ref(false);
  const commitMessage = ref('');
  const selectedVersionId = ref<string | null>(null);

  const projectId = computed(() => currentProject.state?.id);

  const { data: versions, isPending: versionsPending } = useQuery({
    queryKey: computed(() => ['schema-versions', projectId.value]),
    queryFn: () => schemaVersionsApi.getByProjectId(projectId.value!),
    enabled: computed(() => !!projectId.value && open.value),
  });

  const versionAuthorIds = computed(() => {
    const ids = versions.value?.map((version) => version.author_id) ?? [];
    return [...new Set(ids)].sort();
  });

  const { data: authorDisplayNames } = useQuery({
    queryKey: computed(() => ['schema-version-authors', versionAuthorIds.value]),
    queryFn: () => schemaVersionsApi.getAuthorDisplayNames(versionAuthorIds.value),
    enabled: computed(() => versionAuthorIds.value.length > 0 && open.value),
  });

  const authorNameById = computed(() => {
    const map = new Map<string, string>();
    authorDisplayNames.value?.forEach(({ id, display_name }) => {
      map.set(id, display_name);
    });
    return map;
  });

  const getAuthorName = (authorId: string) => {
    return authorNameById.value.get(authorId) ?? t('UNKNOWN_USER');
  };

  const invalidateVersions = () => {
    if (!projectId.value) return;
    void queryClient.invalidateQueries({ queryKey: ['schema-versions', projectId.value] });
    void queryClient.invalidateQueries({ queryKey: ['schema-version-authors'] });
  };

  const { mutateAsync: commitVersion, isPending: isCommitting } = useAdvancedMutation({
    mutationFn: async () => {
      if (!currentProject.state) return;

      await schemaVersionsApi.create({
        project_id: currentProject.state.id,
        schema: cloneDeep(currentProject.state.schema),
        message: commitMessage.value.trim(),
      });
    },
    onSuccess: () => {
      commitMessage.value = '';
      invalidateVersions();
    },
    successMessage: t('SCHEMA_VERSION_COMMITTED'),
    loadingMessage: t('SCHEMA_VERSION_COMMITTING'),
  });

  const { mutateAsync: rollbackToVersion, isPending: isRollingBack } = useAdvancedMutation({
    mutationFn: async (version: Tables<'schema_versions'>) => {
      currentProject.restoreSchema(version.schema);
    },
    onSuccess: () => {
      open.value = false;
      selectedVersionId.value = null;
    },
    successMessage: t('SCHEMA_VERSION_ROLLED_BACK'),
    loadingMessage: t('SCHEMA_VERSION_ROLLING_BACK'),
  });

  const selectedVersion = computed(() => {
    return versions.value?.find((version) => version.id === selectedVersionId.value) ?? null;
  });

  const confirmRollback = async () => {
    if (!selectedVersion.value) return;
    if (!window.confirm(t('SCHEMA_VERSION_ROLLBACK_CONFIRM'))) return;
    await rollbackToVersion(selectedVersion.value);
  };

  const formatVersionDate = (createdAt: string) => {
    return format(new Date(createdAt), 'yyyy-MM-dd');
  };
</script>

<template>
  <Sheet v-model:open="open">
    <SheetTrigger as-child>
      <Button
        variant="secondary"
        size="sm"
        :title="t('SCHEMA_VERSION_HISTORY')"
        :disabled="!currentProject.canEdit"
      >
        <Icon name="lucide:history" size="1rem" class="h-4 w-4" />
      </Button>
    </SheetTrigger>

    <SheetContent side="right" class="flex w-full flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>{{ t('SCHEMA_VERSION_HISTORY') }}</SheetTitle>
        <SheetDescription>{{ t('SCHEMA_VERSION_HISTORY_DESCRIPTION') }}</SheetDescription>
      </SheetHeader>

      <div class="space-y-3">
        <Label for="commit-message">{{ t('SCHEMA_VERSION_MESSAGE') }}</Label>
        <Input
          id="commit-message"
          v-model="commitMessage"
          :placeholder="t('SCHEMA_VERSION_MESSAGE_PLACEHOLDER')"
        />
        <ButtonWithLoading
          class="w-full"
          :loading="isCommitting"
          :disabled="!commitMessage.trim() || !currentProject.state"
          @click="commitVersion"
        >
          {{ t('SCHEMA_VERSION_COMMIT') }}
        </ButtonWithLoading>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <p class="mb-3 text-sm font-medium text-slate-700">{{ t('SCHEMA_VERSION_TIMELINE') }}</p>

        <div v-if="versionsPending" class="py-8 text-center text-sm text-slate-500">
          {{ t('DEFAULT_LOADING_MESSAGE') }}
        </div>

        <p v-else-if="!versions?.length" class="py-8 text-center text-sm text-slate-500">
          {{ t('SCHEMA_VERSION_EMPTY') }}
        </p>

        <div v-else class="relative ml-3 border-l border-slate-200 p-1 pl-6">
          <button
            v-for="version in versions"
            :key="version.id"
            :title="formatVersionDate(version.created_at)"
            type="button"
            class="relative mb-6 block w-full text-left last:mb-0"
            :class="[
              'rounded-md px-2 py-1 transition-colors',
              selectedVersionId === version.id
                ? 'bg-blue-50 ring-1 ring-blue-200'
                : 'hover:bg-slate-50',
            ]"
            @click="selectedVersionId = version.id"
          >
            <span
              :title="formatVersionDate(version.created_at)"
              class="absolute -left-[1.9rem] top-2 h-3 w-3 rounded-full border-2 border-blue-500 bg-white"
              aria-hidden="true"
            />
            <span class="block text-sm font-medium text-slate-900">
              {{ version.message }}
            </span>
            <span class="mt-0.5 block text-xs text-slate-500">
              {{ getAuthorName(version.author_id) }}
            </span>
          </button>
        </div>
      </div>

      <SheetFooter class="mt-auto border-t pt-4">
        <Button
          class="w-full"
          variant="outline"
          :disabled="!selectedVersion || isRollingBack"
          @click="confirmRollback"
        >
          <Icon
            v-if="isRollingBack"
            name="lucide:loader-circle"
            size="1rem"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ t('SCHEMA_VERSION_ROLLBACK') }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
