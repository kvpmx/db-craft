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
    <Title>{{ props.title }}</Title>
    <Meta v-if="props.description" name="description" :content="props.description" />
    <Meta property="og:title" :content="props.title" />
    <Meta v-if="props.description" property="og:description" :content="props.description" />
  </Head>
</template>
