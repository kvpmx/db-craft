<script lang="ts" setup>
  import { routes } from '@/lib/routes';
  import { TeamsController } from '@/lib/controllers';

  const { t } = useI18n();
  const route = useRoute();
  const teamsApi = useApiController(TeamsController);

  const { data: teams, isPending } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => await teamsApi.getAllForUser(),
  });

  const isTeamActive = (teamId: string) => {
    return route.path === routes.team(teamId) || route.path === routes.teamSettings(teamId);
  };
</script>

<template>
  <section class="space-y-3">
    <p class="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {{ t('TEAMS') }}
    </p>

    <div class="space-y-1">
      <SidebarCreateTeamDialog />

      <div class="min-h-9 space-y-0.5">
        <template v-if="isPending">
          <div class="flex flex-col gap-2" aria-hidden="true">
            <Skeleton class="h-8 w-full rounded-md" />
            <Skeleton class="h-8 w-full rounded-md" />
            <Skeleton class="h-8 w-full rounded-md" />
          </div>
        </template>

        <template v-else-if="teams?.length">
          <NuxtLink
            v-for="team in teams"
            :key="team.id"
            :to="routes.team(team.id)"
            class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            :class="
              isTeamActive(team.id)
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            "
          >
            <Icon name="lucide:users" size="1rem" class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ team.name }}</span>
          </NuxtLink>
        </template>

        <p v-else class="px-3 py-2 text-sm text-slate-400/90">{{ t('NO_TEAMS') }}</p>
      </div>
    </div>
  </section>
</template>
