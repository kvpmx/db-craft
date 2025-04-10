<script lang="ts" generic="T extends DatabaseType" setup>
  import type { TableField } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const props = defineProps<{
    tableId: string;
    field: TableField<T>;
  }>();

  const { t } = useI18n();
  const { field } = toRefs(props);
  const currentProject = useCurrentProject();
</script>

<template>
  <DropdownMenu v-if="field">
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="h-7 w-7 px-1.5" :title="t('MORE_OPTIONS')">
        <Icon name="lucide:settings-2" size="0.75rem" class="h-3 w-3" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-56">
      <DropdownMenuCheckboxItem
        v-model:checked="field.primary_key"
        :disabled="field.nullable || (field.auto_increment && !field.primary_key)"
      >
        {{ t('PRIMARY_KEY') }}
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        v-model:checked="field.nullable"
        :disabled="field.primary_key || field.auto_increment"
      >
        {{ t('NULLABLE') }}
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem v-model:checked="field.unique" :disabled="field.primary_key">
        {{ t('UNIQUE') }}
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        v-model:checked="field.auto_increment"
        :disabled="field.nullable || !field.primary_key"
      >
        {{ t('AUTO_INCREMENT') }}
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="flex items-center text-red-600"
        @click="currentProject.deleteField(tableId, field.id)"
      >
        <Icon name="lucide:trash-2" size="1rem" class="h-4 w-4" />
        {{ t('REMOVE') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
