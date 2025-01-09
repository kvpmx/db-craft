<script lang="ts" generic="T extends DatabaseType" setup>
  import { DATABASE_FIELD_TYPES } from '@/lib/constants/diagram';

  import type { ColumnType } from '@/types/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const value = defineModel<ColumnType<T>>({ required: true });
  const open = ref(false);

  const { t } = useI18n();
  const currentProject = useCurrentProject();

  const fieldTypes = computed(() =>
    currentProject.state ? DATABASE_FIELD_TYPES[currentProject.state.type] : []
  );
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        size="xs"
        role="combobox"
        :aria-expanded="open"
        class="w-[120px] justify-between text-xs"
      >
        <span class="truncate">{{ value }}</span>
        <Icon
          name="lucide:chevrons-up-down"
          size="0.75rem"
          class="ml-2 h-3 w-3 shrink-0 opacity-50"
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command>
        <CommandInput class="h-9 p-1 text-xs" :placeholder="t('SEARCH_FIELD_TYPES')" />
        <CommandEmpty class="text-xs">{{ t('NO_FIELD_TYPES_FOUND') }}</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="type in fieldTypes"
              :key="type"
              :value="type"
              :title="type"
              class="w-full px-1.5 py-1 text-xs"
              @select="
                (ev: CustomEvent) => {
                  if (typeof ev.detail.value === 'string') {
                    value = ev.detail.value;
                  }
                  open = false;
                }
              "
            >
              <span class="truncate">{{ type }}</span>
              <Icon
                name="lucide:check"
                size="0.75rem"
                :class="cn('ml-auto h-3 w-3', value === type ? 'opacity-100' : 'opacity-0')"
              />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
