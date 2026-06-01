export const routes = {
  home: () => '/',
  settings: () => '/settings',
  login: () => '/login',
  register: () => '/register',
  diagram: (id: number) => `/diagram/${id}`,
  sharedDiagram: (uuid: string) => `/diagram/share/${uuid}`,
  teams: () => '/teams',
  team: (id: string) => `/teams/${id}`,
  teamSettings: (id: string) => `/teams/${id}/settings`,
  joinTeam: () => '/teams/join',
};
