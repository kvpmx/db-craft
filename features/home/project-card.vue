<script lang="ts" setup>
  import { routes } from '@/lib/routes';
  import { ProjectsController } from '@/lib/controllers';
  import { DATABASES } from '@/lib/constants/diagram';
  import type { Tables } from '@/types/database';

  const { t } = useI18n();

  const props = defineProps<{
    project: Tables<'projects'>;
    searchQuery?: string;
  }>();

  const emit = defineEmits<{
    (e: 'delete', id: number): void;
    (e: 'duplicate', project: Tables<'projects'>): void;
  }>();

  const projectsApi = useApiController(ProjectsController);

  const { data: thumbnailUrl } = useQuery({
    queryKey: ['thumbnail', props.project.id],
    queryFn: async () => await projectsApi.getThumbnailUrl(props.project?.id),
  });

  const db = computed(() => {
    return DATABASES.find((db) => db.value === props.project.type);
  });
</script>

<template>
  <Card>
    <CardHeader class="p-4 pb-3">
      <div class="flex items-center justify-between">
        <CardTitle class="flex w-[90%] items-center gap-2" :title="project.name">
          <div class="rounded-md border-[1px] border-slate-200 bg-slate-200/20 p-1">
            <Icon v-if="db" :name="db.icon" :title="db.name" size="1rem" class="block h-4 w-4" />
          </div>
          <div class="truncate text-lg font-semibold">
            <span v-html="highlightTextOccurrences(project.name, searchQuery)"></span>
          </div>
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-7 w-7">
              <Icon name="lucide:more-vertical" size="1rem" class="h-4 w-4" />
              <span class="sr-only">{{ t('OPEN_MENU') }}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="emit('duplicate', project)">{{
              t('DUPLICATE')
            }}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-red-600" @click="emit('delete', project.id)">
              {{ t('DELETE') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent class="px-4 py-0">
      <NuxtImg
        v-if="!thumbnailUrl"
        src="/images/thumbnail-placeholder.png"
        :alt="project.name"
        class="h-auto w-full rounded-md border-[1px] border-slate-200 bg-slate-200/20 object-cover"
        style="aspect-ratio: 2 / 1"
        placeholder
      />
      <div
        v-else
        class="flex justify-center rounded-md border-[1px] border-slate-200 bg-slate-200/20 py-1"
        style="aspect-ratio: 2 / 1"
      >
        <NuxtImg :src="thumbnailUrl" :alt="project.name" class="h-full w-auto" placeholder />
      </div>
    </CardContent>
    <CardFooter class="flex items-center justify-between gap-2 p-4">
      <span class="text-sm text-gray-500" :title="formatDateAndTime(project.last_modified_at)">
        {{ t('LAST_MODIFIED') }}: {{ formatDate(project.last_modified_at) }}
      </span>

      <NuxtLink :to="routes.diagram(project.id)">
        <Button variant="outline">
          {{ t('OPEN') }}
        </Button>
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
