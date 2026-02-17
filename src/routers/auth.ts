import { constants } from "../constants";
import { RouteHandler } from "../types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { general, hasPermission, verifyMiddleware } from "../middlewares";
import { rolePermissions } from "../types/functions";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.auth.check().path]),
    method: constants.urls.auth.check().method,
    handlers: [controllers.auth.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.auth.login().path]),
    method: constants.urls.auth.login().method,
    handlers: [verifyMiddleware.loginInput, controllers.auth.login],
  },
  {
    path: joinUrls([constants.urls.auth.register().path]),
    method: constants.urls.auth.register().method,
    handlers: [
      general,
      hasPermission(["super_admin"], rolePermissions.CREATE),
      verifyMiddleware.registerInput,
      controllers.auth.register,
    ],
  },
];

export default serviceLoader;
