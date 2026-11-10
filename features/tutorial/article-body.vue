<script setup lang="ts">
  import type { Collections } from '@nuxt/content';
  import TutorialMedia from './media.vue';
  import TutorialTable from './table.vue';

  defineProps<{ article: Collections['tutorial'] }>();

  const components = { 'tutorial-media': TutorialMedia, 'table': TutorialTable };
</script>

<template>
  <ContentRenderer
    :value="article"
    :components="components"
    class="tutorial-prose prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-blue-700 prose-code:before:content-none prose-code:after:content-none"
  />
</template>

<style scoped>
  .tutorial-prose {
    overflow-wrap: anywhere;
    font-size: 0.9375rem;
    line-height: 1.85;
  }

  :deep(h2),
  :deep(h3) {
    scroll-margin-top: 100px;
  }

  :deep(h2) {
    margin-top: 2.75rem;
    font-size: 1.4rem;
  }

  :deep(h3) {
    font-size: 1.05rem;
  }

  :deep(h2 a),
  :deep(h3 a) {
    color: inherit;
    text-decoration: none;
  }

  :deep(h2 a:hover),
  :deep(h3 a:hover) {
    color: #1d4ed8;
  }

  :deep(blockquote) {
    border-color: #93c5fd;
    background: #eff6ff;
    padding: 0.75rem 1.25rem;
    border-radius: 0 0.5rem 0.5rem 0;
    font-style: normal;
    font-weight: 400;
  }

  :deep(blockquote p) {
    margin: 0;
  }

  :deep(blockquote p::before),
  :deep(blockquote p::after) {
    content: none;
  }

  :deep(figure) {
    margin: 2rem 0;
  }

  :deep(img),
  :deep(video) {
    width: 100%;
    height: auto;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  :deep(figcaption) {
    font-size: 0.75rem;
    line-height: 1.6;
    text-align: center;
    color: #64748b;
    margin-top: 0.75rem;
  }

  :deep(pre) {
    max-width: 100%;
    overflow-x: auto;
    font-size: 0.8rem;
  }

  :deep(:not(pre) > code) {
    background: #f1f5f9;
    border-radius: 0.25rem;
    padding: 0.1rem 0.3rem;
  }

  :deep(.tutorial-table) {
    max-width: 100%;
    overflow-x: auto;
  }

  :deep(table) {
    font-size: 0.8rem;
    min-width: 420px;
  }

  :deep(th),
  :deep(td) {
    padding: 0.7rem;
  }

  :deep(th) {
    white-space: nowrap;
  }

  :deep(thead) {
    background: #f8fafc;
  }
</style>
