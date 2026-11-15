<script setup lang="ts">
  const project = useCurrentProject();
  const user = useSupabaseUser();
  const { viewport } = useCanvas();
  const cursors = computed(() =>
    project.participants.flatMap((person) => {
      if (person.userId === user.value?.id || !person.cursor) return [];
      const x = person.cursor.x * viewport.value.zoom + viewport.value.x;
      const y = person.cursor.y * viewport.value.zoom + viewport.value.y;
      return [{ ...person, transform: `translate(${x}px, ${y}px)` }];
    })
  );
</script>

<template>
  <div
    class="diagram-collaboration-cursors pointer-events-none absolute inset-0 z-[1000] overflow-hidden"
    aria-hidden="true"
  >
    <div
      v-for="person in cursors"
      :key="person.sessionId"
      class="absolute left-0 top-0"
      :style="{
        transform: person.transform,
        color: person.color,
      }"
    >
      <svg width="20" height="24" viewBox="0 0 20 24" fill="currentColor">
        <path
          d="M2 2L17 14L10 15L7 22L2 2Z"
          stroke="white"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
      <span
        class="ml-4 block max-w-40 truncate rounded px-2 py-0.5 text-xs font-medium text-white shadow-sm"
        :style="{ backgroundColor: person.color }"
      >
        {{ person.name }}
      </span>
    </div>
  </div>
</template>
