import { routes } from '@/lib/routes';
import { ProjectsController } from '@/lib/controllers';

export default defineNuxtRouteMiddleware(async (to) => {
  try {
    const projectsApi = useApiController(ProjectsController);
    const project = await projectsApi.getById(getRouteParamValue(to.params.id));

    if (!project && to.path !== routes.home()) {
      return navigateTo(routes.home());
    }

    if (project && to.path !== routes.diagram(project.id)) {
      return navigateTo(to);
    }
  } catch {
    return navigateTo(routes.home());
  }
});
