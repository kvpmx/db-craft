<script lang="ts" setup>
  import { toast } from 'vue-sonner';
  import { routes } from '@/lib/routes';

  const { t } = useI18n();
  const siteUrl = useRequestURL();
  const currentProject = useCurrentProject();

  const link = computed(() => {
    if (!currentProject.state) return '';
    return siteUrl.origin + routes.sharedDiagram(currentProject.state.share_id);
  });

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(link.value);
    toast.success(t('COPIED_TO_CLIPBOARD'));
  };
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="sm" variant="link" class="px-0">{{ t('SHARE') }}</Button>
    </DialogTrigger>

    <DialogContent class="max-w-[95%] lg:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ t('SHARE_LINK') }}</DialogTitle>
        <DialogDescription>{{ t('SHARE_LINK_DESCRIPTION') }}</DialogDescription>
      </DialogHeader>

      <div className="flex items-center space-x-2">
        <div className="grid flex-1 gap-2">
          <Label for="link" class="sr-only">{{ t('LINK') }}</Label>
          <Input id="link" :default-value="link" readonly />
        </div>
        <Button
          type="submit"
          size="sm"
          class="px-3"
          :title="t('COPY_TO_CLIPBOARD')"
          @click="copyToClipboard"
        >
          <span className="sr-only">{{ t('COPY_TO_CLIPBOARD') }}</span>
          <Icon name="lucide:copy" size="1rem" class="h-4 w-4" />
        </Button>
      </div>

      <DialogFooter />
    </DialogContent>
  </Dialog>
</template>
