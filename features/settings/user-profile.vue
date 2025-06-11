<script lang="ts" setup>
  const { t, locale, locales, setLocale } = useI18n();
  const user = useSupabaseUser();
  const username = computed(() => getFullUserName(user.value));
</script>

<template>
  <div class="space-y-6 pt-4">
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
      <Label for="language" class="font-semibold">{{ t('LANGUAGE') }}</Label>
      <Select
        :default-value="locale"
        @update:model-value="(value) => setLocale(value as typeof locale)"
      >
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
  </div>
</template>
