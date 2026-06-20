<script lang="ts" setup>
  import { formatDistanceToNow } from 'date-fns';
  import { routes } from '@/lib/routes';
  import { ProjectsController } from '@/lib/controllers';
  import { DATABASES } from '@/lib/constants/diagram';
  import { DATETIME_LOCALES } from '@/lib/constants/locale';
  import type { Tables } from '@/types/database';

  const { t, locale } = useI18n();

  const props = withDefaults(
    defineProps<{
      project: Tables<'projects'>;
      searchQuery?: string;
      canEdit?: boolean;
    }>(),
    { canEdit: true }
  );

  const emit = defineEmits<{
    (e: 'delete', id: number): void;
    (e: 'duplicate', project: Tables<'projects'>): void;
  }>();

  const projectsApi = useApiController(ProjectsController);

  const { data: thumbnailUrl } = useQuery({
    queryKey: ['thumbnail', props.project.id, props.project.team_id],
    queryFn: async () => await projectsApi.getThumbnailUrl(props.project),
  });

  const db = computed(() => {
    return DATABASES.find((db) => db.value === props.project.type);
  });

  const timeAgo = computed(() => {
    const distanceToNow = formatDistanceToNow(new Date(props.project.last_modified_at), {
      locale: DATETIME_LOCALES[locale.value],
    });

    return distanceToNow[0].toUpperCase() + distanceToNow.slice(1);
  });
</script>

<template>
  <Card
    class="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
  >
    <NuxtLink
      :to="routes.diagram(project.id)"
      class="absolute inset-0 z-0 rounded-xl"
      :aria-label="project.name"
    />

    <div class="pointer-events-none relative overflow-hidden bg-white" style="aspect-ratio: 16 / 9">
      <NuxtImg
        v-if="!thumbnailUrl"
        src="/images/thumbnail-placeholder.svg"
        :alt="project.name"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        placeholder
      />
      <div v-else class="flex h-full items-center justify-center bg-white p-4">
        <NuxtImg
          :src="thumbnailUrl"
          :alt="project.name"
          class="h-full max-h-full w-auto transition-transform duration-500 group-hover:scale-[1.03]"
          placeholder
        />
      </div>

      <div
        v-if="db"
        class="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-slate-200/60 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.12)]"
      >
        <Icon :name="db.icon" :title="db.name" class="h-3.5 w-3.5" />
        {{ db.name }}
      </div>
    </div>

    <div v-if="props.canEdit" class="z-2 absolute right-2 top-2">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 rounded-full border border-slate-200/60 bg-white text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.12)] hover:bg-slate-50"
            @click.stop
          >
            <Icon name="lucide:more-horizontal" size="1rem" class="h-4 w-4" />
            <span class="sr-only">{{ t('OPEN_MENU') }}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click.stop="emit('duplicate', project)">
            {{ t('DUPLICATE') }}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-red-600" @click.stop="emit('delete', project.id)">
            {{ t('DELETE') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="pointer-events-none relative z-[1] flex flex-1 flex-col gap-3 p-4 pt-0">
      <h3
        class="truncate text-base font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-slate-700"
        :title="project.name"
      >
        <span v-html="highlightTextOccurrences(project.name, searchQuery)"></span>
      </h3>

      <span
        class="flex min-w-0 items-center gap-1.5 text-xs text-slate-500"
        :title="formatDateAndTime(project.last_modified_at)"
      >
        <Icon name="lucide:clock" class="h-3.5 w-3.5 shrink-0" />
        <span class="truncate">{{ t('TIME_AGO', { time: timeAgo }) }}</span>
      </span>
    </div>
  </Card>
</template>
