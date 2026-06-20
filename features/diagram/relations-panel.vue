<script lang="ts" setup>
  import { getRelationDisplayName, getRelationEndpointLabel } from '@/utils/relation';
  import {
    DEFAULT_RELATION_CARDINALITY,
    RELATION_CARDINALITY_OPTIONS,
  } from '@/lib/constants/diagram';

  import type { TableRelation } from '@/types/diagram';

  defineProps<{ pending: boolean }>();

  const { t } = useI18n();
  const { fitView } = useCanvas();
  const currentProject = useCurrentProject();
  const selectedRelation = useSelectedRelation();

  const searchQuery = ref('');
  const formOpen = ref(false);
  const editingRelation = ref<TableRelation>();

  const tables = computed(() => currentProject.state?.schema.tables ?? []);

  const relations = computed(() => currentProject.state?.schema.relations ?? []);

  const filteredRelations = computed(() => {
    return relations.value.filter((relation) => {
      const displayName = getRelationDisplayName(relation, tables.value);
      const sourceLabel = getRelationEndpointLabel(
        tables.value,
        relation.source,
        relation.source_field
      );
      const targetLabel = getRelationEndpointLabel(
        tables.value,
        relation.target,
        relation.target_field
      );
      const haystack = `${displayName} ${sourceLabel} ${targetLabel}`;

      return includesIgnoreCase(haystack, searchQuery.value);
    });
  });

  const getNotation = (relation: TableRelation) => {
    const source = relation.cardinality?.source ?? DEFAULT_RELATION_CARDINALITY.source;
    const target = relation.cardinality?.target ?? DEFAULT_RELATION_CARDINALITY.target;

    const sourceNotation =
      RELATION_CARDINALITY_OPTIONS.find((option) => option.value === source)?.notation ?? source;

    const targetNotation =
      RELATION_CARDINALITY_OPTIONS.find((option) => option.value === target)?.notation ?? target;

    return `${sourceNotation} : ${targetNotation}`;
  };

  const openCreateDialog = () => {
    editingRelation.value = undefined;
    formOpen.value = true;
  };

  const openEditDialog = (relation: TableRelation) => {
    editingRelation.value = relation;
    formOpen.value = true;
  };

  const selectRelation = (relation: TableRelation) => {
    selectedRelation.setId(relation.id);
    selectedRelation.toggleFlag();
  };

  const focusRelation = (relation: TableRelation) => {
    selectRelation(relation);
    fitView({ nodes: [relation.source, relation.target], duration: 800, padding: 0.5 });
  };

  const deleteRelation = (relation: TableRelation) => {
    if (selectedRelation.id === relation.id) {
      selectedRelation.setId(null);
    }

    currentProject.deleteRelation(relation.id);
  };
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex items-center justify-between gap-4 border-b px-3 py-2">
      <h2 class="text-md font-semibold">{{ t('RELATIONS') }}</h2>
      <Button
        v-if="currentProject.canEdit"
        class="justify-start"
        variant="secondary"
        size="xs"
        :disabled="tables.length < 2"
        @click="openCreateDialog"
      >
        <Icon name="lucide:git-branch" size="1rem" class="mr-2 h-4 w-4" />
        {{ t('NEW_RELATION') }}
      </Button>
    </div>

    <div
      v-if="!filteredRelations.length && !pending"
      class="flex flex-1 items-center justify-center gap-4 overflow-y-scroll px-4 text-center text-xl font-medium italic text-gray-600"
    >
      {{ relations.length ? t('NO_RELATIONS_MATCH') : t('NO_RELATIONS_FOUND') }}
    </div>

    <div v-else class="flex-1 space-y-2 overflow-y-scroll p-2">
      <div
        v-for="relation in filteredRelations"
        :key="relation.id"
        :class="[
          'group rounded-md border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50',
          selectedRelation.id === relation.id && 'ring-2 ring-rose-600 ring-offset-2',
        ]"
        @click="selectRelation(relation)"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <div class="truncate font-medium text-slate-900">
              {{ getRelationDisplayName(relation, tables) }}
            </div>
            <div class="mt-1 flex items-center truncate text-xs text-slate-500">
              <span>{{
                getRelationEndpointLabel(tables, relation.source, relation.source_field)
              }}</span>
              <Icon name="lucide:arrow-right" size="0.75rem" class="mx-1 inline-block h-3 w-3" />
              <span>{{
                getRelationEndpointLabel(tables, relation.target, relation.target_field)
              }}</span>
            </div>
            <div class="mt-1 font-mono text-[10px] text-slate-400">
              {{ getNotation(relation) }}
            </div>
          </div>

          <div class="mt-1.5 flex shrink-0 items-center gap-2">
            <Icon
              v-if="currentProject.canEdit"
              name="lucide:pencil"
              size="0.75rem"
              class="h-3 w-3 opacity-0 transition-opacity hover:cursor-pointer group-hover:opacity-100"
              :title="t('EDIT')"
              @click.stop="openEditDialog(relation)"
            />
            <Icon
              v-if="currentProject.canEdit"
              name="lucide:trash-2"
              size="0.75rem"
              class="h-3 w-3 opacity-0 transition-opacity hover:cursor-pointer group-hover:opacity-100"
              :title="t('REMOVE')"
              @click.stop="deleteRelation(relation)"
            />
            <Icon
              name="lucide:maximize"
              size="0.75rem"
              class="h-3 w-3 opacity-0 transition-opacity hover:cursor-pointer group-hover:opacity-100"
              :title="t('FIT_TO_SCREEN')"
              @click.stop="focusRelation(relation)"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="border-t p-3">
      <div class="relative">
        <Icon
          name="lucide:search"
          size="1rem"
          class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
        />
        <Input
          id="search-relations"
          v-model="searchQuery"
          type="search"
          :title="t('SEARCH_RELATIONS')"
          :placeholder="t('SEARCH')"
          class="pl-10"
        />
      </div>
    </div>

    <DiagramRelationFormDialog v-model:open="formOpen" :relation="editingRelation" />
  </div>
</template>
