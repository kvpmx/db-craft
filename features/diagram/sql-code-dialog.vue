<script lang="ts" setup>
  import { toast } from 'vue-sonner';
  import { configToSQL } from '@/lib/sql-generator';
  import { EDITOR_LANGUAGES } from '@/lib/constants/diagram';
  import type { DatabaseType } from '@/lib/constants/diagram';

  const { t } = useI18n();
  const currentProject = useCurrentProject();

  const sql = computed(() => {
    if (!currentProject.state) return '';
    return configToSQL(currentProject.state.type as DatabaseType, currentProject.state.schema);
  });

  const downloadAsFile = () => {
    if (!currentProject.state) return;

    const link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sql.value));
    link.setAttribute('download', `${currentProject.state.name}.sql`);
    link.click();
    link.remove();

    toast.success(t('FILE_DOWNLOADED_SUCCESSFULLY'));
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(sql.value);
    toast.success(t('COPIED_TO_CLIPBOARD'));
  };

  const editorOptions = {
    fontFamily: 'JetBrains Mono, monospace',
    readOnly: true,
    scrollbar: { verticalScrollbarSize: 5, horizontalScrollbarSize: 5 },
    stickyScroll: { enabled: false },
    minimap: { enabled: false },
    padding: { top: 3 },
  };
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button size="sm" variant="link">
        {{ t('EXPORT_AS_SQL') }}
      </Button>
    </DialogTrigger>

    <DialogScrollContent class="max-w-[95%] lg:max-w-[900px]" @interact-outside.prevent>
      <DialogHeader>
        <DialogTitle class="text-xl font-semibold">
          {{ t('EXPORT') }}
        </DialogTitle>
      </DialogHeader>

      <div class="relative overflow-hidden rounded-md border-[1px] border-gray-300">
        <MonacoEditor
          v-if="currentProject.state"
          v-model="sql"
          :lang="EDITOR_LANGUAGES[currentProject.state.type]"
          :options="editorOptions"
          class="h-[60vh]"
        />
        <Button
          :title="t('COPY_TO_CLIPBOARD')"
          variant="secondary"
          class="absolute bottom-3 right-4 h-[unset] p-2"
          @click="copyToClipboard"
        >
          <Icon name="lucide:copy" size="1rem" class="h-4 w-4" />
        </Button>
      </div>

      <DialogFooter>
        <DialogClose>
          <Button variant="secondary">
            {{ t('CANCEL') }}
          </Button>
        </DialogClose>
        <Button @click="downloadAsFile">
          {{ t('DOWNLOAD_AS_FILE') }}
        </Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
