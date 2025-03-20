<script lang="ts" generic="T extends DatabaseType" setup>
  import type { Table } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<{
    table: Table<T>;
    searchQuery: string;
  }>();

  const { t } = useI18n();
  const { fitView } = useCanvas();
  const currentProject = useCurrentProject();

  // Edit table name
  const editingTableName = ref(false);
  const newTableName = ref(props.table.name);

  const saveNewTableName = () => {
    editingTableName.value = false;

    if (newTableName.value) {
      currentProject.updateTableData(props.table.id, {
        name: newTableName.value,
      });
    }
  };
</script>

<template>
  <template v-if="editingTableName">
    <Input
      v-model.trim="newTableName"
      :name="`tableName${table.id}`"
      class="edit-table-name-input h-6 flex-1 bg-gray-50/50 p-2 focus-visible:ring-transparent focus-visible:ring-offset-transparent"
      :placeholder="table.name"
      autocomplete="off"
      @keyup.enter="saveNewTableName"
    />

    <div
      class="flex h-6 w-6 items-center justify-center rounded-md border-[1px] border-slate-200 bg-gray-50/50"
    >
      <Icon name="lucide:check" size="0.75rem" class="h-3 w-3" @click.stop="saveNewTableName" />
    </div>
  </template>

  <template v-else>
    <div
      class="flex-1 truncate text-left"
      v-html="highlightTextOccurrences(table.name, searchQuery)"
    ></div>

    <Icon
      name="lucide:pencil"
      size="0.75rem"
      class="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
      :title="t('RENAME')"
      @click.stop="editingTableName = true"
    />

    <Icon
      name="lucide:trash-2"
      size="0.75rem"
      class="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
      :title="t('REMOVE')"
      @click.stop=""
    />

    <Icon
      name="lucide:maximize"
      size="0.75rem"
      class="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
      :title="t('FIT_TO_SCREEN')"
      @click.stop="
        fitView({
          nodes: [table.id],
          duration: 1000,
          padding: 0.5,
        })
      "
    />
  </template>
</template>
