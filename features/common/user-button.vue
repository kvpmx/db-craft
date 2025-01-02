<script lang="ts" setup>
  const { t } = useI18n();
</script>

<template>
  <Button variant="ghost" size="icon" class="rounded-full">
    <Icon name="lucide:user-circle" size="1.5rem" class="h-6 w-6" />
    <span class="sr-only">{{ t('USER_PROFILE') }}</span>
  </Button>
</template>
