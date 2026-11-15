<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { routes } from '@/lib/routes';
  import { ProjectsController } from '@/lib/controllers';
  import { DatabaseType, DiagramVisibility } from '@/lib/constants/diagram';

  import type { TablesInsert } from '@/types/database';

  const props = defineProps<{
    teamId?: string;
  }>();

  const { t } = useI18n();
  const projectsApi = useApiController(ProjectsController);

  const isTeamContext = computed(() => Boolean(props.teamId));

  const validationSchema = toTypedSchema(
    z.object({
      name: z
        .string({ required_error: t('NAME_REQUIRED') })
        .nonempty({ message: t('NAME_REQUIRED') }),

      visibility: z.nativeEnum(DiagramVisibility).default(DiagramVisibility.Private),
      type: z.nativeEnum(DatabaseType).default(DatabaseType.MySQL),
    })
  );

  const dialogOpened = ref(false);
  const { handleSubmit } = useForm({ validationSchema });

  const queryClient = useQueryClient();

  const { mutateAsync: createProject, isPending } = useMutation({
    mutationKey: ['createProject', props.teamId],
    mutationFn: async (data: Omit<TablesInsert<'projects'>, 'author'>) => {
      return await projectsApi.create({
        ...data,
        team_id: props.teamId ?? null,
        visibility: isTeamContext.value ? DiagramVisibility.Private : data.visibility,
      });
    },
    onSuccess: (createdProject) => {
      dialogOpened.value = false;
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (createdProject?.id) navigateTo(routes.diagram(createdProject.id));
    },
  });

  const submitCreateDiagramForm = handleSubmit(async (data) => {
    await createProject(data);
  });
</script>

<template>
  <Dialog :open="dialogOpened" @update:open="dialogOpened = !dialogOpened">
    <DialogTrigger as-child>
      <Button>
        <Icon name="lucide:plus" size="1rem" class="mr-2 h-4 w-4" />
        {{ t('NEW_PROJECT') }}
      </Button>
    </DialogTrigger>

    <DialogScrollContent
      class="max-w-[95%] sm:max-w-[600px]"
      @interact-outside.prevent
      @open-auto-focus.prevent
    >
      <DialogHeader>
        <DialogTitle class="text-2xl font-semibold">
          {{ t('NEW_DIAGRAM_MODAL_TITLE') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('NEW_DIAGRAM_MODAL_DESCRIPTION') }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <form class="space-y-6" @submit="submitCreateDiagramForm">
          <HomeProjectFormFields :show-visibility="!isTeamContext" />

          <!-- Submit button -->
          <DialogFooter>
            <ButtonWithLoading
              type="submit"
              class="w-full sm:ml-auto sm:w-auto"
              size="lg"
              :loading="isPending"
            >
              {{ t('CREATE_DIAGRAM') }}
            </ButtonWithLoading>
          </DialogFooter>
        </form>
      </div>
    </DialogScrollContent>
  </Dialog>
</template>
