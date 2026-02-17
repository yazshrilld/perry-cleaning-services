import { constants } from "../constants";
import { RouteHandler } from "../types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.messages.check().path]),
    method: constants.urls.messages.check().method,
    handlers: [controllers.messages.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.messages.createMessage().path]),
    method: constants.urls.messages.createMessage().method,
    handlers: [controllers.messages.createMessage],
  },
  {
    path: joinUrls([constants.urls.messages.getMessages().path]),
    method: constants.urls.messages.getMessages().method,
    handlers: [controllers.messages.getMessages],
  },
  {
    path: joinUrls([constants.urls.messages.updateMessageStatus().path]),
    method: constants.urls.messages.updateMessageStatus().method,
    handlers: [controllers.messages.updateMessageStatus],
  },
];

export default serviceLoader;
