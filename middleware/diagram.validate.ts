import { ProjectsController } from '@/lib/controllers';
import { createValidateMiddleware, ensureCanonicalPath, notFound } from '@/lib/middleware';
import { routes } from '@/lib/routes';

export default createValidateMiddleware(async (to) => {
  const projectsApi = useApiController(ProjectsController);
  const project = await projectsApi.getById(getRouteParamValue(to.params.id));

  if (!project) return notFound();
  return ensureCanonicalPath(to, routes.diagram(project.id));
});
