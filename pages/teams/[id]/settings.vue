<script lang="ts" setup>
  import z from 'zod';
  import { toast } from 'vue-sonner';
  import { TeamMembersController, TeamsController } from '@/lib/controllers';
  import { routes } from '@/lib/routes';
  import { TEAM_ROLES } from '@/types/team';

  import type { TeamRole } from '@/types/team';

  definePageMeta({
    layout: 'main',
    middleware: ['team-validate', 'team-admin-validate'],
  });

  const route = useRoute();
  const router = useRouter();
  const teamId = computed(() => getRouteParamValue(route.params.id));

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const teamsApi = useApiController(TeamsController);
  const membersApi = useApiController(TeamMembersController);

  const { data: team, suspense: teamSuspense } = useQuery({
    queryKey: ['teams', teamId],
    queryFn: async () => await teamsApi.getById(teamId.value),
  });

  const { data: members, suspense: membersSuspense } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => await membersApi.getByTeam(teamId.value),
  });

  onServerPrefetch(async () => {
    await Promise.all([teamSuspense(), membersSuspense()]);
  });

  const inviteEmailSchema = z.string().trim().email();

  const inviteEmails = ref<string[]>([]);
  const inviteRole = ref<TeamRole>('viewer');

  const isInviteFormValid = computed(() => {
    return (
      inviteEmails.value.length > 0 &&
      inviteEmails.value.every((email) => inviteEmailSchema.safeParse(email).success)
    );
  });

  const latestInviteCode = ref<string | null>(null);

  const teamName = ref('');

  watch(
    () => team.value?.name,
    (name) => {
      if (name !== undefined) {
        teamName.value = name;
      }
    },
    { immediate: true }
  );

  const isTeamNameValid = computed(() => teamName.value.trim().length > 0);

  const isTeamNameDirty = computed(() => {
    const currentName = team.value?.name?.trim() ?? '';
    return teamName.value.trim() !== currentName;
  });

  const invalidateTeam = () => {
    queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
    queryClient.invalidateQueries({ queryKey: ['teams'] });
  };

  const invalidateMembers = () => {
    queryClient.invalidateQueries({ queryKey: ['team-members', teamId] });
  };

  const { mutateAsync: updateTeam, isPending: isUpdatingTeam } = useAdvancedMutation({
    mutationKey: ['updateTeam'],
    mutationFn: async (name: string) => await teamsApi.update(teamId.value, { name }),
    successMessage: t('TEAM_UPDATED'),
    onSuccess: invalidateTeam,
  });

  const { mutateAsync: deleteTeam, isPending: isDeletingTeam } = useAdvancedMutation({
    mutationKey: ['deleteTeam'],
    mutationFn: async () => await teamsApi.delete(teamId.value),
    successMessage: t('TEAM_DELETED'),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
      await router.push(routes.home());
    },
  });

  const submitTeamName = async (event: Event) => {
    event.preventDefault();
    if (!isTeamNameValid.value || !isTeamNameDirty.value) return;
    await updateTeam(teamName.value.trim());
  };

  const confirmDeleteTeam = async () => {
    if (!window.confirm(t('DELETE_TEAM_CONFIRM'))) return;
    await deleteTeam();
  };

  const { mutateAsync: createInvite, isPending: isCreatingInvite } = useAdvancedMutation({
    mutationKey: ['createInvite'],
    mutationFn: async () => {
      return await membersApi.createInvite(teamId.value, inviteEmails.value, inviteRole.value);
    },
    successMessage: t('INVITE_CODE_CREATED'),
    onSuccess: (result) => {
      inviteEmails.value = [];
      latestInviteCode.value = result?.invite?.code ?? null;
      invalidateMembers();
    },
  });

  const { mutateAsync: updateRole } = useAdvancedMutation({
    mutationKey: ['updateMemberRole'],
    mutationFn: async ({ memberId, role }: { memberId: string; role: TeamRole }) => {
      await membersApi.updateRole(memberId, role);
    },
    successMessage: t('ROLE_UPDATED'),
    onSuccess: invalidateMembers,
  });

  const { mutateAsync: removeMember } = useAdvancedMutation({
    mutationKey: ['removeMember'],
    mutationFn: async (memberId: string) => await membersApi.remove(memberId),
    successMessage: t('MEMBER_REMOVED'),
    onSuccess: invalidateMembers,
  });

  const { mutateAsync: regenerateCode } = useAdvancedMutation({
    mutationKey: ['regenerateInviteCode'],
    mutationFn: async (inviteId: string) => await membersApi.regenerateCode(inviteId),
    successMessage: t('INVITE_CODE_REGENERATED'),
    onSuccess: (invite) => {
      latestInviteCode.value = invite?.code ?? null;
      invalidateMembers();
    },
  });

  const submitInvite = async (event: Event) => {
    event.preventDefault();
    if (!isInviteFormValid.value) return;
    await createInvite();
  };

  const copyInviteCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    toast.success(t('INVITE_CODE_COPIED'));
  };

  const roleLabel = (role: TeamRole) => t(`ROLE_${role.toUpperCase()}`);
  const statusLabel = (status: string) => {
    return status === 'pending' ? t('MEMBER_PENDING') : t('MEMBER_ACTIVE');
  };

  const memberLabel = (email: string | null) => email ?? t('INVITE_PENDING_MEMBER');
</script>

<template>
  <PageMeta :title="t('TEAM_SETTINGS')" :description="t('TEAM_SETTINGS_DESCRIPTION')" />

  <div class="mb-6 space-y-2">
    <NuxtLink
      :to="routes.team(teamId)"
      class="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
    >
      <Icon name="lucide:arrow-left" size="1rem" class="h-4 w-4" />
      {{ team?.name }}
    </NuxtLink>
    <h1 class="text-2xl font-bold text-slate-900">{{ t('TEAM_SETTINGS') }}</h1>
    <p class="text-sm text-slate-500">{{ t('TEAM_SETTINGS_DESCRIPTION') }}</p>
  </div>

  <section class="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-2 text-lg font-semibold">{{ t('TEAM_DETAILS') }}</h2>
    <p class="mb-4 text-sm text-slate-500">{{ t('TEAM_DETAILS_DESCRIPTION') }}</p>

    <form class="flex flex-wrap items-end gap-4" @submit="submitTeamName">
      <div class="min-w-48 flex-1 space-y-2">
        <Label for="team-name">{{ t('TEAM_NAME') }}</Label>
        <Input
          id="team-name"
          v-model="teamName"
          type="text"
          autocomplete="off"
          :disabled="isUpdatingTeam"
        />
      </div>

      <ButtonWithLoading
        type="submit"
        :loading="isUpdatingTeam"
        :disabled="!isTeamNameValid || !isTeamNameDirty"
      >
        {{ t('SAVE') }}
      </ButtonWithLoading>
    </form>
  </section>

  <section class="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-2 text-lg font-semibold">{{ t('CREATE_INVITE_CODE') }}</h2>
    <p class="mb-4 text-sm text-slate-500">{{ t('CREATE_INVITE_CODE_DESCRIPTION') }}</p>

    <form class="space-y-4" @submit="submitInvite">
      <div class="space-y-2">
        <Label>{{ t('EMAILS') }}</Label>
        <EmailTagsInput v-model="inviteEmails" :placeholder="t('INVITE_EMAILS_PLACEHOLDER')" />
      </div>

      <div class="flex flex-wrap items-end gap-4">
        <div class="min-w-40 flex-1 space-y-2">
          <Label>{{ t('ROLE') }}</Label>
          <Select v-model="inviteRole">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="role in TEAM_ROLES" :key="role" :value="role">
                {{ roleLabel(role) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ButtonWithLoading type="submit" :loading="isCreatingInvite" :disabled="!isInviteFormValid">
          {{ t('GENERATE_INVITE_CODE') }}
        </ButtonWithLoading>
      </div>
    </form>

    <div
      v-if="latestInviteCode"
      class="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-4"
    >
      <div>
        <p class="text-sm text-slate-500">{{ t('INVITE_CODE') }}</p>
        <p class="font-mono text-xl font-semibold tracking-widest text-slate-900">
          {{ latestInviteCode }}
        </p>
      </div>
      <Button variant="outline" @click="copyInviteCode(latestInviteCode)">
        <Icon name="lucide:copy" size="1rem" class="mr-2 h-4 w-4" />
        {{ t('COPY') }}
      </Button>
    </div>
  </section>

  <section class="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="mb-4 text-lg font-semibold">{{ t('TEAM_MEMBERS') }}</h2>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500">
            <th class="pb-3 pr-4 font-medium">{{ t('MEMBER') }}</th>
            <th class="pb-3 pr-4 font-medium">{{ t('ROLE') }}</th>
            <th class="pb-3 pr-4 font-medium">{{ t('STATUS') }}</th>
            <th class="pb-3 font-medium">{{ t('ACTIONS') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="member in members"
            :key="member.id"
            class="border-b border-slate-100 last:border-0"
          >
            <td class="py-3 pr-4">
              <div>{{ memberLabel(member.email) }}</div>
              <div
                v-if="member.status === 'pending' && member.invite?.code"
                class="mt-1 font-mono text-xs tracking-wider text-slate-500"
              >
                {{ member.invite.code }}
              </div>
            </td>
            <td class="py-3 pr-4">
              <Select
                v-if="member.status === 'active' && member.role !== 'admin'"
                :model-value="member.role"
                @update:model-value="
                  (role) => updateRole({ memberId: member.id, role: role as TeamRole })
                "
              >
                <SelectTrigger class="h-8 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="role in TEAM_ROLES" :key="role" :value="role">
                    {{ roleLabel(role) }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <span v-else>{{ roleLabel(member.role) }}</span>
            </td>
            <td class="py-3 pr-4">{{ statusLabel(member.status) }}</td>
            <td class="py-3">
              <div class="flex flex-wrap gap-2">
                <Button
                  v-if="member.status === 'pending' && member.invite?.code"
                  variant="outline"
                  size="sm"
                  @click="copyInviteCode(member.invite.code)"
                >
                  {{ t('COPY') }}
                </Button>
                <Button
                  v-if="member.status === 'pending' && member.invite?.id"
                  variant="outline"
                  size="sm"
                  @click="regenerateCode(member.invite.id)"
                >
                  {{ t('REGENERATE_CODE') }}
                </Button>
                <Button
                  v-if="member.role !== 'admin'"
                  variant="ghost"
                  size="sm"
                  class="text-red-600"
                  @click="removeMember(member.id)"
                >
                  {{ t('REMOVE') }}
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
    <h2 class="mb-2 text-lg font-semibold text-red-700">{{ t('DELETE_TEAM') }}</h2>
    <p class="mb-4 text-sm text-slate-500">{{ t('DELETE_TEAM_DESCRIPTION') }}</p>

    <ButtonWithLoading
      variant="destructive"
      :loading="isDeletingTeam"
      :disabled="isDeletingTeam"
      @click="confirmDeleteTeam"
    >
      {{ t('DELETE_TEAM') }}
    </ButtonWithLoading>
  </section>
</template>
