<script setup lang="ts">
  import { tutorialMessages as copy } from '@/lib/tutorial/messages';
</script>

<template>
  <div class="tutorial-table" tabindex="0" role="region" :aria-label="copy.referenceTable">
    <table>
      <slot />
    </table>
  </div>
</template>
