<script lang="ts" setup>
  import DOMPurify from 'dompurify';
  import { renderChatMarkdown } from '@/lib/markdown/render-chat-markdown';

  import 'highlight.js/styles/github-dark.min.css';

  const props = defineProps<{ content: string }>();

  const html = ref('');

  watch(
    () => props.content,
    (content) => {
      if (!content.trim()) {
        html.value = '';
        return;
      }

      if (!import.meta.client) {
        html.value = '';
        return;
      }

      html.value = DOMPurify.sanitize(renderChatMarkdown(content), {
        ADD_ATTR: ['class'],
      });
    },
    { immediate: true }
  );
</script>

<template>
  <div
    v-if="html"
    class="prose prose-sm prose-slate min-w-0 max-w-full text-xs leading-5 prose-headings:font-semibold prose-headings:text-slate-900 prose-p:my-1.5 prose-code:rounded prose-code:bg-zinc-200 prose-code:px-1 prose-code:py-0.5 prose-code:text-zinc-700 prose-code:before:content-none prose-code:after:content-none prose-pre:my-2 prose-pre:bg-transparent prose-pre:p-0 prose-li:my-0.5 prose-hr:my-4 [&_.hljs-block]:my-2"
    v-html="html"
  />
  <p v-else-if="content.trim()" class="whitespace-pre-wrap">{{ content }}</p>
</template>

<style scoped>
  :deep(.hljs-block) {
    overflow-x: auto;
    padding: 0;
    background: rgb(24 24 27);
    scrollbar-width: thin;
    scrollbar-color: rgb(82 82 91) transparent;
  }

  :deep(.hljs-block)::-webkit-scrollbar {
    height: 6px;
  }

  :deep(.hljs-block)::-webkit-scrollbar-track {
    background: transparent;
  }

  :deep(.hljs-block)::-webkit-scrollbar-thumb {
    background: rgb(82 82 91);
    border-radius: 999px;
  }

  :deep(.hljs-block)::-webkit-scrollbar-thumb:hover {
    background: rgb(113 113 122);
  }

  :deep(.hljs-block code) {
    display: block;
    width: max-content;
    min-width: 100%;
    overflow-x: visible;
    font-size: 0.6875rem;
    line-height: 1.5;
    background: transparent;
    padding: 0.75rem;
  }

  :deep(.md-table-wrap) {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    max-width: 100%;
    overflow-x: auto;
  }

  :deep(.md-table-wrap table) {
    width: max-content;
    min-width: 100%;
    margin-block: 0.5rem;
  }

  :deep(.md-table-wrap th),
  :deep(.md-table-wrap td) {
    overflow-wrap: break-word;
  }
</style>
