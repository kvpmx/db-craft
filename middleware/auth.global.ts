import { routes } from '@/lib/routes';

const AUTH_ROUTES = [routes.login(), routes.register()];

export default defineNuxtRouteMiddleware(async (to) => {
  const supabaseClient = useSupabaseClient();
  const session = useSupabaseSession();

  if (to.query?.code) {
    await supabaseClient.auth.exchangeCodeForSession(to.query.code as string);
  }

  if (session.value && AUTH_ROUTES.some((route) => to.path === route)) {
    return navigateTo(routes.home());
  }
});
