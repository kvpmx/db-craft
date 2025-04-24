export const routes = {
  home: () => '/',
  login: () => '/login',
  register: () => '/register',
  diagram: (id: number) => `/diagram/${id}`,
  sharedDiagram: (uuid: string) => `/diagram/share/${uuid}`,
};
