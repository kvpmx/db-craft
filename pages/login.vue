<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';
  import { routes } from '@/lib/routes';

  const supabase = useSupabaseClient();
  const { withAuthError } = useAuthErrorHandler();

  const validationSchema = toTypedSchema(
    z.object({
      email: z
        .string({ required_error: 'Email is required' })
        .email({ message: 'The email is invalid' }),

      password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters' }),
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
  <PageMeta title="Login | DB Craft" description="Login to your account" />

  <main class="flex min-h-screen items-center justify-center bg-auth px-4 py-12 sm:px-6 lg:px-8">
    <Card class="mx-auto w-full max-w-md rounded-xl">
      <CardHeader>
        <CardTitle class="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit="submitLoginForm">
          <div class="space-y-4">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Password</FormLabel>
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
              Login
            </Button>
            <Button
              type="button"
              variant="outline"
              class="w-full"
              :disabled="loading.valueOf()"
              @click="loginWithGoogle"
            >
              <Icon name="flat-color-icons:google" size="1.25rem" class="mr-2" />
              Login with Google
            </Button>
          </div>
        </form>

        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <a href="#" class="underline">Sign up</a>
        </div>
      </CardContent>
    </Card>

    <Toaster />
  </main>
</template>
