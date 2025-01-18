<script lang="ts" setup>
  import { DEFAULT_COLORS } from '@/lib/constants/colors';

  const selectedColor = defineModel<string>({ required: true });
</script>

<template>
  <div class="grid grid-cols-5 gap-1.5">
    <Button
      v-for="color in DEFAULT_COLORS"
      :key="color"
      :style="{ backgroundColor: color }"
      :data-state="selectedColor === color ? 'on' : 'off'"
      class="h-8 rounded-md border-[1px] border-gray-400 p-0 data-[state=on]:border-2 data-[state=on]:border-black"
      @click="selectedColor = color"
    ></Button>
  </div>
</template>
