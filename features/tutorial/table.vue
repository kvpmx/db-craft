<script setup lang="ts">
  import { resolveTutorialLocale, tutorialMessages } from '@/lib/tutorial/messages';

  const { locale } = useI18n();
  const copy = computed(() => tutorialMessages[resolveTutorialLocale(locale.value)]);
</script>

<template>
  <div class="tutorial-table" tabindex="0" role="region" :aria-label="copy.referenceTable">
    <table>
      <slot />
    </table>
  </div>
</template>
