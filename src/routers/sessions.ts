import { constants } from "../constants";
import { RouteHandler } from "../types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";
const serviceLoader: RouteHandler[] = [

  {
    path: joinUrls([constants.urls.sessions.check().path]),
    method: constants.urls.sessions.check().method,
    handlers: [controllers.sessions.checkServiceHealth],   
  }, 
  {
    path: joinUrls([constants.urls.sessions.addSession().path]),
    method: constants.urls.sessions.addSession().method,
    handlers: [verifyMiddleware.addSessionInput, controllers.sessions.addSession],
  },
    {
    path: joinUrls([constants.urls.sessions.getSessions().path]),
    method: constants.urls.sessions.getSessions().method,
    handlers: [verifyMiddleware.validateVeiwAllInput, controllers.sessions.fectchSessions],
  },
//   {
//     path: joinUrls([constants.urls.sessions.decryptData().path]),
//     method: constants.urls.sessions.decryptData().method,
//     handlers: [controllers.sessions.internopayDEcryption],
//   },
];

export default serviceLoader;
