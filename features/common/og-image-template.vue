<script lang="ts" setup>
  defineProps<{
    title: string;
    description?: string;
    logo: string;
  }>();
</script>

<template>
  <div
    class="flex h-full w-full items-start justify-start"
    :style="{
      backgroundImage: 'linear-gradient(to right, #dfe9f3, #a6c1ee, #7b9bdb)',
    }"
  >
    <div class="flex h-full items-start justify-start">
      <div class="flex h-full w-full flex-col justify-between p-20">
        <NuxtImg :src="logo" height="100" :alt="title" />
        <div>
          <h1 class="text-left text-[60px] font-bold text-slate-800">
            {{ title }}
          </h1>
          <p v-if="description" class="text-left text-[40px] font-semibold text-slate-600">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
