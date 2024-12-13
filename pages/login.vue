<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { routes } from '@/lib/routes';

  const supabase = useSupabaseClient();
  const { withAuthError } = useAuthErrorHandler();

  const { t } = useI18n();

  const validationSchema = toTypedSchema(
    z.object({
      email: z
        .string({ required_error: t('EMAIL_REQUIRED') })
        .email({ message: t('EMAIL_INVALID') }),

      password: z
        .string({ required_error: t('PASSWORD_REQUIRED') })
        .min(8, { message: t('PASSWORD_MIN_LENGTH') }),
    })
  );

  const loading = ref(false);

  const { handleSubmit } = useForm({ validationSchema });

  const submitLoginForm = handleSubmit(async ({ email, password }) => {
    loading.value = true;

    const success = await withAuthError(
      supabase.auth.signInWithPassword({
        email,
        password,
      })
    );

    loading.value = false;

    if (success) navigateTo(routes.home());
  });

  const loginWithGoogle = async () => {
    await withAuthError(
      supabase.auth.signInWithOAuth({
        provider: 'google',
      })
    );
  };
</script>

<template>
  <PageMeta :title="t('LOGIN_PAGE_TITLE')" :description="t('LOGIN_PAGE_DESCRIPTION')" />

  <main class="flex min-h-screen items-center justify-center bg-auth px-4 py-12 sm:px-6 lg:px-8">
    <Card class="mx-auto w-full max-w-md rounded-xl">
      <CardHeader>
        <CardTitle class="text-2xl">{{ t('LOGIN') }}</CardTitle>
        <CardDescription>{{ t('LOGIN_FORM_DESCRIPTION') }}</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit="submitLoginForm">
          <div class="space-y-4">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>{{ t('EMAIL') }}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    v-bind="componentField"
                    autocomplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <FormLabel>{{ t('PASSWORD') }}</FormLabel>
                <FormControl>
                  <Input type="password" v-bind="componentField" autocomplete="current-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <div class="mt-6 grid gap-4">
            <Button type="submit" class="w-full" :disabled="loading.valueOf()">
              <Icon
                v-if="loading.valueOf()"
                name="lucide:loader-circle"
                size="1rem"
                class="mr-2 animate-spin text-white"
              />
              {{ t('LOGIN') }}
            </Button>
            <Button
              type="button"
              variant="outline"
              class="w-full"
              :disabled="loading.valueOf()"
              @click="loginWithGoogle"
            >
              <Icon name="flat-color-icons:google" size="1.25rem" class="mr-2" />
              {{ t('LOGIN_WITH_GOOGLE') }}
            </Button>
          </div>
        </form>

        <div class="mt-4 text-center text-sm">
          {{ t('DO_NOT_HAVE_ACCOUNT') }}
          <a href="#" class="underline">{{ t('SIGN_UP') }}</a>
        </div>
      </CardContent>
    </Card>

    <Toaster />
  </main>
</template>
