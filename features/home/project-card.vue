<script lang="ts" setup>
  import { routes } from '@/lib/routes';
  import type { Tables } from '@/types/database';

  const { t } = useI18n();

  const props = defineProps<{
    project: Tables<'projects'>;
  }>();

  const emit = defineEmits<{
    (e: 'delete', id: number): void;
    (e: 'duplicate', project: Tables<'projects'>): void;
  }>();
</script>

<template>
  <Card>
    <CardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <CardTitle
          class="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-semibold"
          :title="props.project.name"
        >
          {{ props.project.name }}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-7 w-7">
              <Icon name="lucide:more-vertical" size="1rem" />
              <span class="sr-only">{{ t('OPEN_MENU') }}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem @click="emit('duplicate', props.project)">{{
              t('DUPLICATE')
            }}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-red-600" @click="emit('delete', props.project.id)">
              {{ t('DELETE') }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent class="pb-4">
      <NuxtImg
        :src="props.project.thumbnail ?? '/images/thumbnail-placeholder.png'"
        :alt="`Thumbnail for ${props.project.name}`"
        class="h-auto w-full rounded-md object-cover"
        style="aspect-ratio: 2 / 1"
        placeholder
      />
    </CardContent>
    <CardFooter class="flex items-center justify-between gap-2">
      <span
        class="text-sm text-gray-500"
        :title="formatDateAndTime(props.project.last_modified_at)"
      >
        {{ t('LAST_MODIFIED') }}: {{ formatDate(props.project.last_modified_at) }}
      </span>

      <NuxtLink :to="routes.diagram(props.project.id)">
        <Button variant="outline">
          {{ t('OPEN') }}
        </Button>
      </NuxtLink>
    </CardFooter>
  </Card>
</template>
