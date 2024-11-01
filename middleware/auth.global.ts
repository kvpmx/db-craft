import { routes } from '@/lib/routes';

export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  if (user.value && to.path === routes.login()) {
    return navigateTo(routes.home());
  }

  if (!user.value && to.path !== routes.login()) {
    return navigateTo(routes.login());
  }
});
