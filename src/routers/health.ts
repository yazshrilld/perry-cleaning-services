import { constants } from "../constants";
import { RouteHandler } from "../types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
const serviceLoader: RouteHandler[] = [

  {
    path: joinUrls([constants.urls.health.check().path]),
    method: constants.urls.health.check().method,
    handlers: [controllers.health.checkServiceHealth],   
  }, 
  {
    path: joinUrls([constants.urls.health.encrytData().path]),
    method: constants.urls.health.encrytData().method,
    handlers: [controllers.health.internopayEncryption],
  },
  {
    path: joinUrls([constants.urls.health.decryptData().path]),
    method: constants.urls.health.decryptData().method,
    handlers: [controllers.health.internopayDEcryption],
  },
];

export default serviceLoader;
