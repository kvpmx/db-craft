<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { toast } from 'vue-sonner';
  import { routes } from '@/lib/routes';

  import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';

  const { t } = useI18n();
  const supabase = useSupabaseClient();

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

  const { handleSubmit } = useForm({ validationSchema });

  const { mutateAsync: signInWithPassword, isPending } = useMutation({
    mutationKey: ['signInWithPassword'],
    mutationFn: async (data: SignInWithPasswordCredentials) => {
      await supabase.auth.signInWithPassword(data);
    },
    onError: (error: Error) => toast.error(error.toString()),
    onSuccess: () => navigateTo(routes.home()),
  });

  const submitLoginForm = handleSubmit(async (data) => await signInWithPassword(data));

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
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
            <ButtonWithLoading type="submit" class="w-full" :loading="isPending">
              {{ t('LOGIN') }}
            </ButtonWithLoading>

            <Button
              type="button"
              variant="outline"
              class="w-full"
              :disabled="isPending"
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
