<script lang="ts" setup>
  import z from 'zod';
  import { toTypedSchema } from '@vee-validate/zod';

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

  const { handleSubmit } = useForm({ validationSchema });

  const submit = handleSubmit((values) => {
    console.log(values);
  });
</script>

<template>
  <main class="flex justify-center items-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-auth">
    <Card class="w-full mx-auto max-w-md rounded-xl">
      <CardHeader>
        <CardTitle class="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit="submit">
          <div class="space-y-4">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField v-slot="{ componentField }" name="password">
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input id="password" type="password" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>

          <div class="grid gap-4 mt-6">
            <Button type="submit" class="w-full">Login</Button>
            <Button variant="outline" class="w-full">Login with Google</Button>
          </div>
        </form>

        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <a href="#" class="underline">Sign up</a>
        </div>
      </CardContent>
    </Card>
  </main>
</template>
