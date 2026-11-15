<script lang="ts" setup>
  import { DatabaseType, DiagramVisibility, DATABASES } from '@/lib/constants/diagram';

  const props = withDefaults(defineProps<{ showVisibility?: boolean }>(), {
    showVisibility: true,
  });

  const { t } = useI18n();
</script>

<template>
  <!-- Diagram name -->
  <FormField v-slot="{ componentField }" name="name">
    <FormItem>
      <FormLabel>{{ t('DIAGRAM_NAME') }}</FormLabel>
      <FormControl>
        <Input type="text" v-bind="componentField" autocomplete="off" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>

  <!-- Diagram visibility -->
  <FormField v-if="props.showVisibility" v-slot="{ componentField }" type="radio" name="visibility">
    <FormItem>
      <FormLabel>{{ t('DIAGRAM_VISIBILITY') }}</FormLabel>

      <FormControl>
        <RadioGroup
          class="flex gap-4"
          v-bind="componentField"
          :default-value="DiagramVisibility.Public"
        >
          <FormItem class="flex items-center gap-x-2 space-y-0">
            <FormControl>
              <RadioGroupItem :value="DiagramVisibility.Public" />
            </FormControl>
            <FormLabel class="font-normal">{{ t('PUBLIC') }}</FormLabel>
          </FormItem>

          <FormItem class="flex items-center gap-x-2 space-y-0">
            <FormControl>
              <RadioGroupItem :value="DiagramVisibility.Private" />
            </FormControl>
            <FormLabel class="font-normal">{{ t('PRIVATE') }}</FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
    </FormItem>
  </FormField>

  <!-- Database type -->
  <FormField v-slot="{ componentField }" name="type">
    <FormItem>
      <FormLabel>{{ t('DATABASE_TYPE') }}</FormLabel>

      <FormControl>
        <ToggleGroup
          v-bind="componentField"
          type="single"
          class="flex flex-wrap gap-4"
          :default-value="DatabaseType.MySQL"
        >
          <ToggleGroupItem
            v-for="db in DATABASES"
            :key="db.name"
            :value="db.value"
            class="relative h-auto min-w-40 flex-1 cursor-pointer rounded-lg border p-4 transition-colors"
          >
            <div class="flex flex-col items-center gap-2">
              <Icon :name="db.icon" :alt="db.name" size="2rem" class="h-8 w-8" />
              <span class="text-sm font-medium">{{ db.name }}</span>
            </div>
          </ToggleGroupItem>
        </ToggleGroup>
      </FormControl>

      <slot name="type-description" />
    </FormItem>
  </FormField>
</template>
