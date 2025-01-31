<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { toast } from 'vue-sonner';
  import { routes } from '@/lib/routes';

  import type { SignUpWithPasswordCredentials } from '@supabase/supabase-js';

  definePageMeta({ layout: 'auth' });

  const { t } = useI18n();
  const supabase = useSupabaseClient();

  const validationSchema = toTypedSchema(
    z.object({
      firstName: z
        .string({ required_error: t('FIRST_NAME_REQUIRED') })
        .min(1, { message: t('FIRST_NAME_REQUIRED') }),

      lastName: z
        .string({ required_error: t('LAST_NAME_REQUIRED') })
        .min(1, { message: t('LAST_NAME_REQUIRED') }),

      email: z
        .string({ required_error: t('EMAIL_REQUIRED') })
        .email({ message: t('EMAIL_INVALID') }),

      password: z
        .string({ required_error: t('PASSWORD_REQUIRED') })
        .min(8, { message: t('PASSWORD_MIN_LENGTH') }),
    })
  );

  const { handleSubmit } = useForm({ validationSchema });

  const { mutateAsync: registerNewUser, isPending } = useMutation({
    mutationKey: ['registerNewUser'],
    mutationFn: async (data: SignUpWithPasswordCredentials) => {
      await supabase.auth.signUp(data);
    },
    onError: (error: Error) => toast.error(error.toString()),
    onSuccess: () => navigateTo(routes.home()),
  });

  const submitRegisterForm = handleSubmit(async (data) => {
    await registerNewUser({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });
  });
</script>

<template>
  <PageMeta :title="t('REGISTER_PAGE_TITLE')" :description="t('REGISTER_PAGE_DESCRIPTION')" />

  <Card class="mx-auto w-full max-w-md rounded-xl">
    <CardHeader>
      <CardTitle class="text-2xl">{{ t('SIGN_UP') }}</CardTitle>
      <CardDescription>{{ t('REGISTER_FORM_DESCRIPTION') }}</CardDescription>
    </CardHeader>

    <CardContent>
      <form @submit="submitRegisterForm">
        <div class="mb-2 grid grid-cols-2 gap-4">
          <FormField v-slot="{ componentField }" name="firstName">
            <FormItem>
              <FormLabel>{{ t('FIRST_NAME') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" autocomplete="given-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="lastName">
            <FormItem>
              <FormLabel>{{ t('LAST_NAME') }}</FormLabel>
              <FormControl>
                <Input type="text" v-bind="componentField" autocomplete="family-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div class="space-y-4">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>{{ t('EMAIL') }}</FormLabel>
              <FormControl>
                <Input type="email" v-bind="componentField" autocomplete="email" />
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
            {{ t('SIGN_UP') }}
          </ButtonWithLoading>
        </div>
      </form>

      <div class="mt-4 text-center text-sm">
        {{ t('ALREADY_HAVE_ACCOUNT') }}
        <a :href="routes.login()" class="underline">{{ t('LOGIN') }}</a>
      </div>
    </CardContent>
  </Card>
</template>
