import type { RouteLocationNormalized } from 'vue-router';

export type MiddlewareResult =
  | undefined
  | ReturnType<typeof navigateTo>
  | ReturnType<typeof createError>;

export type MiddlewareHandler = (to: RouteLocationNormalized) => Promise<MiddlewareResult>;

export const notFound = () => createError({ statusCode: 404 });

export const serverError = (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);

  return createError({
    statusCode: 500,
    message: message[0].toUpperCase() + message.slice(1),
  });
};

export const ensureCanonicalPath = (to: RouteLocationNormalized, canonicalPath: string) => {
  if (to.path !== canonicalPath) {
    return navigateTo(to);
  }
};

export const createValidateMiddleware = (handler: MiddlewareHandler) => {
  return defineNuxtRouteMiddleware(async (to) => {
    try {
      return await handler(to);
    } catch (err) {
      return serverError(err);
    }
  });
};
