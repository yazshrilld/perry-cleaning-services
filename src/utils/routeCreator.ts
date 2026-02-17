import { HttpMethod } from "../types";

export const routeCreator = (path: string, method: HttpMethod = "get") => ({
  path,
  method,
});
