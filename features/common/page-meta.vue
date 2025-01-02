<script lang="ts" setup>
  const props = defineProps<{
    title: string;
    description?: string;
  }>();

  defineOgImageComponent('OgImageTemplate', {
    title: props.title,
    description: props.description,
    logo: '/images/logo.png',
  });
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
    <Meta v-if="description" name="description" :content="description" />
    <Meta property="og:title" :content="title" />
    <Meta v-if="description" property="og:description" :content="description" />
  </Head>
</template>
