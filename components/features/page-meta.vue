<script lang="ts" setup>
  const props = defineProps<{
    title: string;
    description?: string;
  }>();

  defineOgImageComponent('BrandedLogo', {
    title: props.title,
    description: props.description,
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
