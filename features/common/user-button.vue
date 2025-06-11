<script lang="ts" setup>
  const { t } = useI18n();

  const user = useSupabaseUser();
  const supabase = useSupabaseClient();
  const username = computed(() => getFullUserName(user.value));

  const settingsOpened = ref(false);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="rounded-full border-2 border-slate-200 bg-slate-100"
      >
        <Avatar>
          <AvatarImage :src="user.user_metadata.avatar_url" :alt="username" />
          <AvatarFallback class="flex items-center justify-center">
            <Icon name="lucide:user" size="1.5rem" class="h-6 w-6 text-slate-400" />
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent>
      <DropdownMenuLabel>{{ username ?? user.user_metadata.email }}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="settingsOpened = true">{{ t('USER_PROFILE') }}</DropdownMenuItem>
      <DropdownMenuItem class="text-red-600" @click="onSignOut">
        {{ t('SIGN_OUT') }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <SettingsDialog v-model="settingsOpened" />
</template>
