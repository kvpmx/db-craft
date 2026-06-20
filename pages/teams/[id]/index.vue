<script lang="ts" setup>
  import { ProjectsController, TeamsController } from '@/lib/controllers';
  import { routes } from '@/lib/routes';
  import type { TablesInsert } from '@/types/database';

  definePageMeta({
    layout: 'main',
    middleware: ['team-validate'],
  });

  const route = useRoute();
  const teamId = computed(() => getRouteParamValue(route.params.id));

  const { t } = useI18n();
  const queryClient = useQueryClient();
  const projectsApi = useApiController(ProjectsController);
  const teamsApi = useApiController(TeamsController);

  const { data: team, suspense: teamSuspense } = useQuery({
    queryKey: ['teams', teamId],
    queryFn: async () => await teamsApi.getById(teamId.value),
  });

  const { data, suspense, isPending } = useQuery({
    queryKey: ['projects', 'team', teamId],
    queryFn: async () => await projectsApi.getByTeam(teamId.value),
  });

  onServerPrefetch(async () => {
    await Promise.all([teamSuspense(), suspense()]);
  });

  const searchQuery = ref('');

  const filteredProjects = computed(() => {
    return data.value?.filter((project) => includesIgnoreCase(project.name, searchQuery.value));
  });

  const canCreateProject = computed(() => {
    return team.value?.role === 'admin' || team.value?.role === 'editor';
  });

  const invalidateProjectsQuery = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const { mutateAsync: deleteProject } = useAdvancedMutation({
    mutationKey: ['deleteProject'],
    mutationFn: async (id: number) => await projectsApi.delete(id),
    successMessage: t('PROJECT_DELETED'),
    onSuccess: invalidateProjectsQuery,
  });

  const { mutateAsync: duplicateProject } = useAdvancedMutation({
    mutationKey: ['duplicateProject'],
    mutationFn: async (project: TablesInsert<'projects'>) => await projectsApi.duplicate(project),
    successMessage: t('PROJECT_DUPLICATED'),
    onSuccess: invalidateProjectsQuery,
  });
</script>

<template>
  <PageMeta :title="team?.name ?? t('TEAMS')" :description="t('TEAM_PROJECTS_DESCRIPTION')" />

  <div class="mb-4 flex items-center justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ team?.name }}</h1>
      <p class="text-sm text-slate-500">{{ t('TEAM_PROJECTS_DESCRIPTION') }}</p>
    </div>

    <div class="flex items-center gap-2">
      <NuxtLink v-if="team?.role === 'admin'" :to="routes.teamSettings(teamId)">
        <Button variant="outline" size="sm">
          <Icon name="lucide:settings" size="1rem" class="mr-2 h-4 w-4" />
          {{ t('TEAM_SETTINGS') }}
        </Button>
      </NuxtLink>
    </div>
  </div>

  <div class="mb-6 flex items-center justify-between gap-2">
    <div class="relative w-full max-w-md">
      <Icon
        name="lucide:search"
        size="1rem"
        class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
      />
      <Input
        id="search-team-projects"
        v-model="searchQuery"
        type="search"
        :placeholder="t('SEARCH_PROJECTS')"
        class="pl-10"
      />
    </div>

    <HomeCreateDiagramModal v-if="canCreateProject" :team-id="teamId" />
  </div>

  <div
    v-if="!isPending && !filteredProjects?.length"
    class="my-40 flex flex-1 items-center justify-center text-center text-xl font-medium italic text-gray-600"
  >
    {{ t('NO_PROJECTS_FOUND') }}
  </div>
  <div v-else class="grid grid-cols-1 gap-6 sm-tablet:grid-cols-2 lg:grid-cols-3">
    <template v-if="isPending">
      <div
        v-for="index in 6"
        :key="index"
        class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm"
      >
        <Skeleton class="aspect-[16/9] w-full rounded-none" />
        <div class="flex flex-col gap-3 p-4">
          <Skeleton class="h-5 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </div>
      </div>
    </template>
    <template v-else>
      <HomeProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        :search-query="searchQuery"
        :can-edit="canCreateProject"
        @delete="deleteProject"
        @duplicate="duplicateProject"
      />
    </template>
  </div>
</template>
