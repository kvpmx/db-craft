<script setup lang="ts">
  import { uniqBy } from 'es-toolkit';

  const { t } = useI18n();
  const project = useCurrentProject();
  const people = computed(() =>
    uniqBy(project.participants, (person) => person.userId).map((person) => ({
      ...person,
      initials: person.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase(),
    }))
  );
  const statusLabel = computed(() => {
    if (project.collaborationStatus === 'live') return t('COLLABORATION_LIVE');
    if (project.collaborationStatus === 'error') return t('COLLABORATION_ERROR');
    if (project.collaborationStatus === 'offline') return t('COLLABORATION_OFFLINE');
    return t('COLLABORATION_CONNECTING');
  });
</script>

<template>
  <div v-if="project.isCollaborative" class="flex items-center gap-2">
    <span
      role="status"
      :aria-label="statusLabel"
      :title="statusLabel"
      class="h-2 w-2 shrink-0 rounded-full"
      :class="
        project.collaborationStatus === 'live' ? 'bg-emerald-500' : 'animate-pulse bg-amber-500'
      "
    />
    <div
      class="flex max-w-40 -space-x-2 overflow-x-auto py-1"
      :aria-label="t('COLLABORATION_PEOPLE')"
    >
      <Avatar
        v-for="person in people"
        :key="person.userId"
        class="h-8 w-8 shrink-0 border-2 bg-white"
        :style="{ borderColor: person.color }"
        :title="person.name"
      >
        <AvatarImage v-if="person.avatar" :src="person.avatar" :alt="person.name" />
        <AvatarFallback class="text-xs font-semibold" :style="{ color: person.color }">
          {{ person.initials }}
        </AvatarFallback>
      </Avatar>
    </div>
  </div>
</template>
