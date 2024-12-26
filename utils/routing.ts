/**
 * Retrieves the value of a route parameter, handling both string and string array cases.
 *
 * @param param - The route parameter, which may be a string or an array of strings.
 * @returns The first string value if the parameter is an array, or the parameter itself if it's a string.
 */
export const getRouteParamValue = (param: string | string[]) => {
  return Array.isArray(param) ? param[0] : param;
};
