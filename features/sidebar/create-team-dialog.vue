<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { routes } from '@/lib/routes';
  import { TeamsController } from '@/lib/controllers';

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const teamsApi = useApiController(TeamsController);

  const dialogOpened = ref(false);

  const validationSchema = toTypedSchema(
    z.object({
      name: z
        .string({ required_error: t('TEAM_NAME_REQUIRED') })
        .min(1, { message: t('TEAM_NAME_REQUIRED') }),
    })
  );

  const { handleSubmit, resetForm } = useForm({ validationSchema });

  const { mutateAsync: createTeam, isPending } = useMutation({
    mutationKey: ['createTeam'],
    mutationFn: async (name: string) => await teamsApi.create(name),
    onSuccess: (team) => {
      dialogOpened.value = false;
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (team?.id) navigateTo(routes.team(team.id));
    },
  });

  const submitCreateTeamForm = handleSubmit(async (data) => {
    await createTeam(data.name);
  });

  watch(dialogOpened, (open) => {
    if (!open) resetForm();
  });
</script>

<template>
  <Dialog :open="dialogOpened" @update:open="dialogOpened = !dialogOpened">
    <DialogTrigger as-child>
      <Button
        variant="ghost"
        class="mb-2 h-auto w-full justify-start gap-2 rounded-lg border border-dashed border-slate-200/90 bg-white/60 px-3 py-2 text-sm font-medium text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900"
      >
        <Icon name="lucide:plus" size="1rem" class="h-4 w-4 shrink-0 text-slate-500" />
        {{ t('CREATE_TEAM') }}
      </Button>
    </DialogTrigger>

    <DialogScrollContent class="max-w-[95%] sm:max-w-[440px]" @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle>{{ t('CREATE_TEAM') }}</DialogTitle>
        <DialogDescription>{{ t('CREATE_TEAM_DESCRIPTION') }}</DialogDescription>
      </DialogHeader>

      <form class="space-y-4 py-4" @submit="submitCreateTeamForm">
        <FormField v-slot="{ componentField }" name="name">
          <FormItem>
            <FormLabel>{{ t('TEAM_NAME') }}</FormLabel>
            <FormControl>
              <Input type="text" v-bind="componentField" autocomplete="off" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <DialogFooter>
          <ButtonWithLoading type="submit" :loading="isPending">
            {{ t('CREATE_TEAM') }}
          </ButtonWithLoading>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>
