import { routes } from '@/lib/routes';
import { ProjectsController } from '@/lib/controllers';

export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const projectsApi = useApiController(ProjectsController);
    const project = await projectsApi.getPublic(getRouteParamValue(to.params.uuid));

    if (!project || project.visibility !== 'public') {
      return createError({ statusCode: 404 });
    }

    if (to.path !== routes.sharedDiagram(project.share_id)) {
      return navigateTo(to);
    }
  } catch (err) {
    const message = (err as Error).message;
    return createError({
      statusCode: 500,
      message: message[0].toUpperCase() + message.slice(1),
    });
  }
});
