<script lang="ts" setup>
  import { getRelationFieldName, getRelationTableName } from '@/utils/relation';

  import type { Table } from '@/types/diagram';

  const props = defineProps<{
    tables: Table[];
    tableId?: string;
    fieldId?: string;
    disabled?: boolean;
    placeholder?: string;
  }>();

  const emit = defineEmits<{
    'update:tableId': [value: string];
    'update:fieldId': [value: string];
  }>();

  const { t } = useI18n();

  const open = ref(false);

  const hasSelection = computed(() => Boolean(props.tableId && props.fieldId));

  const selectedTableName = computed(() => {
    if (!props.tableId) return '';
    return getRelationTableName(props.tables, props.tableId) ?? '?';
  });

  const selectedFieldName = computed(() => {
    if (!props.tableId || !props.fieldId) return '';
    return getRelationFieldName(props.tables, props.tableId, props.fieldId) ?? '?';
  });

  const selectField = (tableId: string, fieldId: string) => {
    emit('update:tableId', tableId);
    emit('update:fieldId', fieldId);
    open.value = false;
  };
</script>

<template>
  <DropdownMenu v-model:open="open">
    <DropdownMenuTrigger as-child :disabled="disabled">
      <button
        type="button"
        :disabled="disabled"
        :class="
          cn(
            'flex h-8 w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-start text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            !hasSelection && 'text-neutral-500'
          )
        "
      >
        <span v-if="hasSelection" class="min-w-0 truncate">
          <span class="text-slate-900">{{ selectedTableName }}</span>
          <span class="text-slate-400">.</span>
          <span class="text-slate-500">{{ selectedFieldName }}</span>
        </span>
        <span v-else class="truncate">{{ placeholder || t('SELECT_TABLE_FIELD') }}</span>
        <Icon name="lucide:chevron-down" size="1rem" class="h-4 w-4 shrink-0 opacity-50" />
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="max-h-60 w-52 overflow-y-auto">
      <div v-if="!tables.length" class="px-2 py-1.5 text-sm text-slate-500">
        {{ t('NO_TABLES_FOUND') }}
      </div>

      <DropdownMenuSub v-for="table in tables" v-else :key="table.id">
        <DropdownMenuSubTrigger :class="table.id === tableId && 'bg-slate-100'">
          <span class="truncate">{{ table.name }}</span>
        </DropdownMenuSubTrigger>

        <DropdownMenuSubContent class="min-w-32">
          <DropdownMenuItem
            v-for="field in table.fields"
            :key="field.id"
            :class="table.id === tableId && field.id === fieldId && 'bg-slate-100'"
            @select="selectField(table.id, field.id)"
          >
            {{ field.name }}
          </DropdownMenuItem>

          <div v-if="!table.fields.length" class="px-2 py-1.5 text-sm text-slate-500">
            {{ t('NO_FIELDS') }}
          </div>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
