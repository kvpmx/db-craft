<script lang="ts" setup>
  import { DATABASE_FIELD_TYPES, DATABASES } from '@/lib/constants/diagram';

  import { parseFieldType } from '@/lib/diagram/type-migration';

  import type { DatabaseType } from '@/lib/constants/diagram';
  import type { TypeMapping, TypeMismatch } from '@/lib/diagram/type-migration';

  const props = defineProps<{
    mismatches: TypeMismatch[];
    source: DatabaseType;
    target: DatabaseType;
    initialMapping?: TypeMapping;
  }>();

  const emit = defineEmits<{
    (e: 'confirm', mapping: TypeMapping): void;
    (e: 'cancel'): void;
  }>();

  const { t } = useI18n();

  const baseType = (type: string) => parseFieldType(type).base;

  const mapping = ref<TypeMapping>(
    Object.fromEntries(
      props.mismatches.map(({ sourceType, suggestion }) => {
        const initial = props.initialMapping?.[sourceType];

        return [sourceType, initial ? baseType(initial) : suggestion ? baseType(suggestion) : ''];
      })
    )
  );

  const sourceDatabase = computed(() => DATABASES.find((db) => db.value === props.source));
  const targetDatabase = computed(() => DATABASES.find((db) => db.value === props.target));

  const getOptions = () => DATABASE_FIELD_TYPES[props.target];

  const isSuggested = (mismatch: TypeMismatch) => {
    return (
      !!mismatch.suggestion && mapping.value[mismatch.sourceType] === baseType(mismatch.suggestion)
    );
  };

  const mappedCount = computed(() => {
    return props.mismatches.filter(({ sourceType }) => mapping.value[sourceType]).length;
  });

  const isComplete = computed(() => mappedCount.value === props.mismatches.length);

  const formatFields = (mismatch: TypeMismatch) => {
    return mismatch.fields.map(({ table, field }) => `${table}.${field}`).join(', ');
  };

  const confirm = () => {
    if (!isComplete.value) return;

    // Accepting a suggestion keeps arguments the migration generated, such as
    // decimal(19,4). Those stay on the field for SQL export and are not editable here.
    const resolved = Object.fromEntries(
      props.mismatches.map(({ sourceType, suggestion }) => {
        const selected = mapping.value[sourceType] ?? '';
        const type = suggestion && selected === baseType(suggestion) ? suggestion : selected;

        return [sourceType, type];
      })
    );

    emit('confirm', resolved);
  };
</script>

<template>
  <div class="grid gap-4 py-4">
    <div class="flex items-center gap-3 text-sm font-medium text-slate-700">
      <span v-if="sourceDatabase" class="flex items-center gap-1.5">
        <Icon :name="sourceDatabase.icon" class="h-4 w-4" />
        {{ sourceDatabase.name }}
      </span>
      <Icon name="lucide:arrow-right" class="h-4 w-4 text-slate-400" />
      <span v-if="targetDatabase" class="flex items-center gap-1.5">
        <Icon :name="targetDatabase.icon" class="h-4 w-4" />
        {{ targetDatabase.name }}
      </span>
      <span class="ml-auto text-xs font-normal text-slate-500">
        {{ t('TYPE_MIGRATION_PROGRESS', { mapped: mappedCount, total: mismatches.length }) }}
      </span>
    </div>

    <ul class="flex flex-col gap-2">
      <li
        v-for="mismatch in mismatches"
        :key="mismatch.sourceType"
        :class="
          cn(
            'grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border p-3 transition-colors',
            isSuggested(mismatch)
              ? 'border-emerald-200 bg-emerald-50'
              : !mapping[mismatch.sourceType]
                ? 'border-amber-200 bg-amber-50'
                : 'border-slate-200 bg-white'
          )
        "
      >
        <div class="min-w-0">
          <div class="truncate font-mono text-sm font-medium text-slate-900">
            {{ mismatch.sourceType }}
          </div>
          <div class="truncate text-xs text-slate-500" :title="formatFields(mismatch)">
            {{ formatFields(mismatch) }}
          </div>
        </div>

        <Icon name="lucide:arrow-right" class="h-4 w-4 text-slate-400" />

        <Select v-model="mapping[mismatch.sourceType]">
          <SelectTrigger
            :class="
              cn(
                'h-9 font-mono text-sm',
                isSuggested(mismatch) && 'border-emerald-300 text-emerald-800'
              )
            "
            :aria-label="mismatch.sourceType"
          >
            <SelectValue :placeholder="t('TYPE_MIGRATION_SELECT_TYPE')" />
          </SelectTrigger>
          <SelectContent class="max-h-72">
            <SelectItem
              v-for="type in getOptions()"
              :key="type"
              :value="type"
              :class="cn('font-mono', type === mismatch.suggestion && 'text-emerald-700')"
            >
              {{ type }}
            </SelectItem>
          </SelectContent>
        </Select>
      </li>
    </ul>

    <DialogFooter class="gap-2">
      <Button type="button" variant="outline" @click="emit('cancel')">
        {{ t('BACK') }}
      </Button>
      <Button type="button" :disabled="!isComplete" @click="confirm">
        {{ t('TYPE_MIGRATION_APPLY') }}
      </Button>
    </DialogFooter>
  </div>
</template>
