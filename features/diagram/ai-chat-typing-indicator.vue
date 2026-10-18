<script lang="ts" setup>
  defineProps<{
    label?: string;
  }>();
</script>

<template>
  <div class="flex items-center gap-2 px-1 py-2 text-slate-500" aria-live="polite">
    <span class="inline-flex gap-1">
      <span class="typing-dot" />
      <span class="typing-dot animation-delay-150" />
      <span class="typing-dot animation-delay-300" />
    </span>
    <span v-if="label" class="text-xs">{{ label }}</span>
  </div>
</template>

<style scoped>
  .typing-dot {
    height: 0.375rem;
    width: 0.375rem;
    border-radius: 9999px;
    background: rgb(148 163 184);
    animation: typing-bounce 1.2s infinite ease-in-out;
  }

  .animation-delay-150 {
    animation-delay: 0.15s;
  }

  .animation-delay-300 {
    animation-delay: 0.3s;
  }

  @keyframes typing-bounce {
    0%,
    80%,
    100% {
      transform: translateY(0);
      opacity: 0.45;
    }

    40% {
      transform: translateY(-0.25rem);
      opacity: 1;
    }
  }
</style>
