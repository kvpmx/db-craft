<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { toast } from 'vue-sonner';
  import { TeamInvitesController } from '@/lib/controllers';
  import { routes } from '@/lib/routes';

  definePageMeta({ layout: 'main' });

  const { t } = useI18n();
  const route = useRoute();
  const user = useSupabaseUser();
  const queryClient = useQueryClient();
  const invitesApi = useApiController(TeamInvitesController);

  const initialCode = computed(() => {
    const invite = route.query.invite ?? route.query.code;
    return typeof invite === 'string' ? invite : '';
  });

  const validationSchema = toTypedSchema(
    z.object({
      code: z
        .string({ required_error: t('INVITE_CODE_REQUIRED') })
        .min(1, { message: t('INVITE_CODE_REQUIRED') })
        .transform((value) => value.trim().toUpperCase()),
    })
  );

  const { handleSubmit, values } = useForm({
    validationSchema,
    initialValues: { code: initialCode.value },
  });

  const normalizedCode = computed(() => values.code?.trim().toUpperCase() ?? '');

  const { data: invitePreview, isFetching: isPreviewLoading } = useQuery({
    queryKey: ['team-invite-preview', normalizedCode, () => user.value?.id ?? null],
    queryFn: async () => {
      if (normalizedCode.value.length < 4) return null;
      return await invitesApi.getByCode(normalizedCode.value);
    },
    enabled: computed(() => normalizedCode.value.length >= 4),
  });

  const showInvitePreview = computed(() =>
    Boolean(
      invitePreview.value?.valid &&
        invitePreview.value.email_matches &&
        invitePreview.value.team_name &&
        invitePreview.value.role
    )
  );

  const previewError = computed(() => {
    if (!normalizedCode.value || normalizedCode.value.length < 4) return null;
    if (isPreviewLoading.value) return null;
    if (!invitePreview.value) return t('INVITE_CODE_NOT_FOUND');
    if (!invitePreview.value.valid) return t('INVITE_CODE_EXPIRED');
    if (invitePreview.value.email_matches === false) {
      return t('INVITE_EMAIL_MISMATCH');
    }
    return null;
  });

  const canSubmit = computed(() => {
    if (!normalizedCode.value || normalizedCode.value.length < 4) return false;
    if (isPreviewLoading.value) return false;
    if (previewError.value) return false;
    return Boolean(invitePreview.value?.valid && invitePreview.value.email_matches);
  });

  const { mutateAsync: acceptInvite, isPending: isAccepting } = useMutation({
    mutationKey: ['acceptInviteByCode'],
    mutationFn: async (code: string) => await invitesApi.accept(code),
    onSuccess: (teamId) => {
      toast.success(t('TEAM_JOINED'));
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (teamId) navigateTo(routes.team(teamId));
    },
    onError: (error: Error) => {
      const message = error.message.includes('Invite email does not match')
        ? t('INVITE_EMAIL_MISMATCH')
        : error.message;

      toast.error(message);
    },
  });

  const submitJoinForm = handleSubmit(async ({ code }) => {
    await acceptInvite(code);
  });
</script>

<template>
  <PageMeta :title="t('JOIN_TEAM')" :description="t('JOIN_TEAM_DESCRIPTION')" />

  <div class="mx-auto max-w-md space-y-6">
    <div class="space-y-2 text-center">
      <h1 class="text-2xl font-bold text-slate-900">{{ t('JOIN_TEAM') }}</h1>
      <p class="text-sm text-slate-500">{{ t('JOIN_TEAM_DESCRIPTION') }}</p>
    </div>

    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <form class="space-y-4" @submit="submitJoinForm">
        <FormField v-slot="{ componentField }" name="code">
          <FormItem>
            <FormLabel>{{ t('INVITE_CODE') }}</FormLabel>
            <FormControl>
              <Input
                type="text"
                v-bind="componentField"
                autocomplete="off"
                class="font-mono uppercase tracking-widest"
                :placeholder="t('INVITE_CODE_PLACEHOLDER')"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <div
          v-if="showInvitePreview"
          class="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm"
        >
          <p class="font-medium text-slate-900">
            {{ t('JOIN_TEAM_PREVIEW', { team: invitePreview!.team_name }) }}
          </p>
          <p class="mt-1 text-slate-500">
            {{ t('ROLE') }}: {{ t(`ROLE_${invitePreview!.role!.toUpperCase()}`) }}
          </p>
        </div>

        <p v-else-if="previewError" class="text-sm text-red-600">
          {{ previewError }}
        </p>

        <ButtonWithLoading
          type="submit"
          class="w-full"
          :loading="isAccepting"
          :disabled="!canSubmit"
        >
          {{ t('JOIN_TEAM') }}
        </ButtonWithLoading>
      </form>
    </section>
  </div>
</template>
