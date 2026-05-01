export const routes = {
  home: () => '/',
  settings: () => '/settings',
  login: () => '/login',
  register: () => '/register',
  diagram: (id: number) => `/diagram/${id}`,
  sharedDiagram: (uuid: string) => `/diagram/share/${uuid}`,
};
