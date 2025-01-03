<script lang="ts" setup>
  import { colors } from '@/lib/constants/colors';

  const selectedColor = defineModel<string>({ required: true });
</script>

<template>
  <ToggleGroup v-model="selectedColor" type="single" class="grid grid-cols-5">
    <ToggleGroupItem
      v-for="color in colors"
      :key="color"
      :value="color"
      :style="{ backgroundColor: color }"
      class="h-8 rounded-md border-[1px] border-gray-400 p-0 data-[state=on]:border-2 data-[state=on]:border-black"
    />
  </ToggleGroup>
</template>
