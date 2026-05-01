<script lang="ts" setup>
  import type { ProfileSettings } from '@/types/user-settings';

  const { t, locales } = useI18n();

  const emit = defineEmits<{ submit: [] }>();
  const settings = defineModel<ProfileSettings>({ required: true });

  const user = useSupabaseUser();
  const username = computed(() => getFullUserName(user.value));

  const submitSettingsForm = () => {
    emit('submit');
  };
</script>

<template>
  <form class="space-y-6 pt-4" @submit.prevent="submitSettingsForm">
    <div class="flex items-center gap-4">
      <Avatar class="h-20 w-20">
        <AvatarImage :src="user.user_metadata.avatar_url" :alt="username" />
        <AvatarFallback class="flex items-center justify-center">
          <Icon name="lucide:user" size="1.5rem" class="h-6 w-6 text-slate-400" />
        </AvatarFallback>
      </Avatar>
      <div class="flex flex-col">
        <b>{{ username }}</b>
        <span class="text-sm text-neutral-500">{{ user.user_metadata.email }}</span>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="language">{{ t('LANGUAGE') }}</Label>
      <Select v-model="settings.language">
        <SelectTrigger id="language">
          <SelectValue :placeholder="t('LANGUAGE')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="loc in locales" :key="loc.code" :value="loc.code">
            {{ loc.name ? t(loc.name) : loc.code }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div class="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
      <slot name="actions" />
    </div>
  </form>
</template>
