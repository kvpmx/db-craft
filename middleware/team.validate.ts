import { TeamsController } from '@/lib/controllers';
import { createValidateMiddleware, notFound } from '@/lib/middleware';

export default createValidateMiddleware(async (to) => {
  const teamsApi = useApiController(TeamsController);
  const team = await teamsApi.getById(getRouteParamValue(to.params.id));

  if (!team) return notFound();
});
