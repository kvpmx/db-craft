import { ProjectsController } from '@/lib/controllers';
import { createValidateMiddleware, ensureCanonicalPath, notFound } from '@/lib/middleware';
import { routes } from '@/lib/routes';

export default createValidateMiddleware(async (to) => {
  const projectsApi = useApiController(ProjectsController);
  const project = await projectsApi.getPublic(getRouteParamValue(to.params.uuid));

  if (!project || project.visibility !== 'public') {
    return notFound();
  }

  return ensureCanonicalPath(to, routes.sharedDiagram(project.share_id));
});
