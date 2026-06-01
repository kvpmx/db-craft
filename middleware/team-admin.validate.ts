import { TeamsController } from '@/lib/controllers';
import { createValidateMiddleware, notFound } from '@/lib/middleware';
import { routes } from '@/lib/routes';

export default createValidateMiddleware(async (to) => {
  const teamsApi = useApiController(TeamsController);
  const teamId = getRouteParamValue(to.params.id);
  const team = await teamsApi.getById(teamId);

  if (!team) return notFound();
  if (team.role !== 'admin') return navigateTo(routes.team(teamId));
});
