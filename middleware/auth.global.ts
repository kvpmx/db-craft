import { routes } from '@/lib/routes';

export default defineNuxtRouteMiddleware(async (to) => {
  const supabaseClient = useSupabaseClient();
  const session = useSupabaseSession();

  if (to.query?.code) {
    await supabaseClient.auth.exchangeCodeForSession(to.query.code as string);
  }

  if (session.value && to.path === routes.login()) {
    return navigateTo(routes.home());
  }

  if (!session.value && to.path !== routes.login()) {
    return navigateTo(routes.login());
  }
});
