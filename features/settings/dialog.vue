<script lang="ts" setup>
  const { t } = useI18n();
  const open = defineModel<boolean>();
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ t('USER_PROFILE') }}
        </DialogTitle>
      </DialogHeader>
      <SettingsUserProfile />
    </DialogContent>
  </Dialog>
</template>
