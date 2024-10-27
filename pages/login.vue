<template>
  <main class="flex justify-center items-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-auth">
    <Card class="w-full mx-auto max-w-md rounded-xl">
      <CardHeader>
        <CardTitle class="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
      </CardHeader>

      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" placeholder="user@example.com" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" class="w-full">Login</Button>
          <Button variant="outline" class="w-full">Login with Google</Button>
        </div>

        <div class="mt-4 text-center text-sm">
          Don't have an account?
          <a href="#" class="underline">Sign up</a>
        </div>
      </CardContent>
    </Card>
  </main>
</template>
