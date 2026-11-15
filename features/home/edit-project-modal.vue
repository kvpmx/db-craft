<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { ProjectsController } from '@/lib/controllers';
  import { DatabaseType, DiagramVisibility, DATABASES } from '@/lib/constants/diagram';
  import { applyTypeMapping, findTypeMismatches } from '@/lib/diagram/type-migration';

  import type { Tables } from '@/types/database';
  import type { TypeMapping, TypeMismatch } from '@/lib/diagram/type-migration';

  const props = defineProps<{
    project: Tables<'projects'>;
  }>();

  const open = defineModel<boolean>('open', { required: true });

  const { t } = useI18n();
  const projectsApi = useApiController(ProjectsController);
  const queryClient = useQueryClient();

  const isTeamProject = computed(() => Boolean(props.project.team_id));

  const validationSchema = toTypedSchema(
    z.object({
      name: z
        .string({ required_error: t('NAME_REQUIRED') })
        .trim()
        .nonempty({ message: t('NAME_REQUIRED') }),

      visibility: z.nativeEnum(DiagramVisibility),
      type: z.nativeEnum(DatabaseType),
    })
  );

  const { handleSubmit, resetForm, setFieldValue, values } = useForm({ validationSchema });

  // The last database type whose field types the user has resolved.
  const confirmedType = ref<DatabaseType>(props.project.type as DatabaseType);
  const typeMapping = ref<TypeMapping>({});
  const confirmedMismatches = ref<TypeMismatch[]>([]);

  const migrationOpen = ref(false);
  const migrationTarget = ref<DatabaseType>(props.project.type as DatabaseType);
  const migrationMismatches = ref<TypeMismatch[]>([]);
  const migrationInitialMapping = ref<TypeMapping>({});

  watch(
    open,
    (isOpen) => {
      if (!isOpen) return;

      resetForm({
        values: {
          name: props.project.name,
          visibility: props.project.visibility as DiagramVisibility,
          type: props.project.type as DatabaseType,
        },
      });

      confirmedType.value = props.project.type as DatabaseType;
      typeMapping.value = {};
      confirmedMismatches.value = [];
      migrationOpen.value = false;
    },
    { immediate: true }
  );

  watch(
    () => values.type,
    (type) => {
      if (!open.value || type === confirmedType.value) return;

      // The toggle group allows deselecting the active item.
      if (!type) {
        setFieldValue('type', confirmedType.value);
        return;
      }

      const found =
        type === props.project.type ? [] : findTypeMismatches(props.project.schema, type);

      if (!found.length) {
        confirmedType.value = type;
        typeMapping.value = {};
        confirmedMismatches.value = [];
        return;
      }

      migrationTarget.value = type;
      migrationMismatches.value = found;
      migrationInitialMapping.value = {};
      migrationOpen.value = true;
    }
  );

  const confirmMigration = (mapping: TypeMapping) => {
    confirmedType.value = migrationTarget.value;
    confirmedMismatches.value = migrationMismatches.value;
    typeMapping.value = mapping;
    migrationOpen.value = false;
  };

  const cancelMigration = () => {
    setFieldValue('type', confirmedType.value);
    migrationOpen.value = false;
  };

  const migrationTargetDatabase = computed(() =>
    DATABASES.find((db) => db.value === migrationTarget.value)
  );

  const reviewMigration = () => {
    migrationTarget.value = confirmedType.value;
    migrationMismatches.value = confirmedMismatches.value;
    migrationInitialMapping.value = typeMapping.value;
    migrationOpen.value = true;
  };

  const typeChanged = computed(() => confirmedType.value !== props.project.type);
  const confirmedDatabase = computed(() =>
    DATABASES.find((db) => db.value === confirmedType.value)
  );
  const convertedTypesCount = computed(() => Object.keys(typeMapping.value).length);

  const { mutateAsync: updateProject, isPending } = useAdvancedMutation({
    mutationKey: ['updateProject', props.project.id],
    mutationFn: async (data: { name: string; visibility: DiagramVisibility }) => {
      const mapping = typeMapping.value;
      const hasMapping = typeChanged.value && Object.keys(mapping).length > 0;

      await projectsApi.updateDetails(
        props.project,
        {
          name: data.name,
          visibility: isTeamProject.value ? props.project.visibility : data.visibility,
          type: confirmedType.value,
        },
        hasMapping ? (schema) => applyTypeMapping(schema, mapping) : undefined
      );
    },
    successMessage: t('PROJECT_UPDATED'),
    onSuccess: () => {
      open.value = false;
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const submitEditProjectForm = handleSubmit(async (data) => {
    await updateProject(data);
  });
</script>

<template>
  <Dialog :open="open" @update:open="(value) => (open = value)">
    <DialogScrollContent
      class="max-w-[95%] sm:max-w-[600px]"
      @interact-outside.prevent
      @open-auto-focus.prevent
    >
      <DialogHeader v-if="migrationOpen">
        <DialogTitle class="text-2xl font-semibold">
          {{ t('TYPE_MIGRATION_TITLE') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('TYPE_MIGRATION_DESCRIPTION', { database: migrationTargetDatabase?.name }) }}
        </DialogDescription>
      </DialogHeader>
      <DialogHeader v-else>
        <DialogTitle class="text-2xl font-semibold">
          {{ t('EDIT_PROJECT_MODAL_TITLE') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('EDIT_PROJECT_MODAL_DESCRIPTION') }}
        </DialogDescription>
      </DialogHeader>

      <HomeTypeMigrationStep
        v-if="migrationOpen"
        :mismatches="migrationMismatches"
        :source="project.type as DatabaseType"
        :target="migrationTarget"
        :initial-mapping="migrationInitialMapping"
        @confirm="confirmMigration"
        @cancel="cancelMigration"
      />

      <!-- Hidden rather than unmounted, so the form keeps its field values. -->
      <div v-show="!migrationOpen" class="grid gap-6 py-4">
        <form class="space-y-6" @submit="submitEditProjectForm">
          <HomeProjectFormFields :show-visibility="!isTeamProject">
            <template #type-description>
              <div
                v-if="typeChanged"
                class="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
              >
                <span v-if="convertedTypesCount">
                  {{
                    t('TYPE_MIGRATION_SUMMARY', {
                      count: convertedTypesCount,
                      database: confirmedDatabase?.name,
                    })
                  }}
                </span>
                <span v-else>
                  {{ t('TYPE_MIGRATION_COMPATIBLE', { database: confirmedDatabase?.name }) }}
                </span>

                <Button
                  v-if="convertedTypesCount"
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="reviewMigration"
                >
                  {{ t('TYPE_MIGRATION_REVIEW') }}
                </Button>
              </div>
            </template>
          </HomeProjectFormFields>

          <DialogFooter>
            <ButtonWithLoading
              type="submit"
              class="w-full sm:ml-auto sm:w-auto"
              size="lg"
              :loading="isPending"
            >
              {{ t('SAVE_CHANGES') }}
            </ButtonWithLoading>
          </DialogFooter>
        </form>
      </div>
    </DialogScrollContent>
  </Dialog>
</template>
