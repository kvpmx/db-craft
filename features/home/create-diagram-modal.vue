<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { routes } from '@/lib/routes';
  import { ProjectsController } from '@/lib/controllers';
  import { DatabaseType, DiagramVisibility } from '@/lib/constants/diagram';
  import type { TablesInsert } from '@/types/database';

  const { t } = useI18n();
  const projectsApi = useApiController(ProjectsController);

  const databases = [
    { name: 'MySQL', value: DatabaseType.MySQL, icon: 'devicon:mysql' },
    { name: 'PostgreSQL', value: DatabaseType.PostgreSQL, icon: 'devicon:postgresql' },
    { name: 'SQL Server', value: DatabaseType.SQLServer, icon: 'devicon:microsoftsqlserver' },
  ];

  const validationSchema = toTypedSchema(
    z.object({
      name: z
        .string({ required_error: t('NAME_REQUIRED') })
        .min(1, { message: t('NAME_REQUIRED') }),

      visibility: z.nativeEnum(DiagramVisibility).default(DiagramVisibility.Public),
      type: z.nativeEnum(DatabaseType).default(DatabaseType.MySQL),
    })
  );

  const dialogOpened = ref(false);
  const { handleSubmit } = useForm({ validationSchema });

  const { mutateAsync: createProject, isPending } = useMutation({
    mutationKey: ['createProject'],
    mutationFn: async (data: Omit<TablesInsert<'projects'>, 'author'>) => {
      return await projectsApi.create(data);
    },
    onSuccess: (createdProject) => {
      dialogOpened.value = false;
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
          <!-- Diagram name -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel>{{ t('DIAGRAM_NAME') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" autocomplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Diagram visibility -->
          <FormField v-slot="{ componentField }" type="radio" name="visibility">
            <FormItem>
              <FormLabel>{{ t('DIAGRAM_VISIBILITY') }}</FormLabel>

              <FormControl>
                <RadioGroup
                  class="flex gap-4"
                  v-bind="componentField"
                  :default-value="DiagramVisibility.Public"
                >
                  <FormItem class="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem :value="DiagramVisibility.Public" />
                    </FormControl>
                    <FormLabel class="font-normal">{{ t('PUBLIC') }}</FormLabel>
                  </FormItem>

                  <FormItem class="flex items-center gap-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem :value="DiagramVisibility.Private" />
                    </FormControl>
                    <FormLabel class="font-normal">{{ t('PRIVATE') }}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Database type -->
          <FormField v-slot="{ componentField }" name="type">
            <FormItem>
              <FormLabel>{{ t('DATABASE_TYPE') }}</FormLabel>

              <FormControl>
                <ToggleGroup
                  v-bind="componentField"
                  type="single"
                  class="flex flex-wrap gap-4"
                  :default-value="DatabaseType.MySQL"
                >
                  <ToggleGroupItem
                    v-for="db in databases"
                    :key="db.name"
                    :value="db.value"
                    class="hover:border-primary relative h-auto min-w-40 flex-1 cursor-pointer rounded-lg border p-4 transition-colors"
                  >
                    <div class="flex flex-col items-center gap-2">
                      <Icon :name="db.icon" :alt="db.name" size="2rem" class="h-8 w-8" />
                      <span class="text-sm font-medium">{{ db.name }}</span>
                    </div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </FormControl>
            </FormItem>
          </FormField>

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
