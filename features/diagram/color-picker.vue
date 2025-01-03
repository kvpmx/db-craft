<script lang="ts" setup>
  const color = defineModel<string>({ required: true });
</script>

<template>
  <Popover>
    <PopoverTrigger>
      <div
        :style="{ backgroundColor: color }"
        class="h-6 w-8 rounded-md border-[1px] border-gray-400"
      ></div>
    </PopoverTrigger>
    <PopoverContent>
      <DiagramPalette v-model="color" />
    </PopoverContent>
  </Popover>
</template>
