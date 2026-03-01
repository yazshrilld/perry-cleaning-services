import { constants } from "../constants";
import { RouteHandler } from "../types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import {
  general,
  hasPermission,
  signatureProtected,
  verifyMiddleware,
} from "../middlewares";
import { rolePermissions } from "../types/functions";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.customer.getCustomers().path]),
    method: constants.urls.customer.getCustomers().method,
    handlers: [
      signatureProtected,
      general,
      hasPermission(["admin", "super_admin"], rolePermissions.READ),
      verifyMiddleware.customerGetAllInput,
      controllers.customer.getCustomers,
    ],
  },
  {
    path: joinUrls([constants.urls.customer.getCustomerById().path]),
    method: constants.urls.customer.getCustomerById().method,
    handlers: [
      signatureProtected,
      general,
      verifyMiddleware.customerIdParamInput,
      controllers.customer.getCustomerById,
    ],
  },
  {
    path: joinUrls([constants.urls.customer.updateCustomer().path]),
    method: constants.urls.customer.updateCustomer().method,
    handlers: [
      signatureProtected,
      general,
      verifyMiddleware.customerIdParamInput,
      verifyMiddleware.updateCustomerInput,
      controllers.customer.patchCustomer,
    ],
  },
  {
    path: joinUrls([constants.urls.customer.deleteCustomer().path]),
    method: constants.urls.customer.deleteCustomer().method,
    handlers: [
      signatureProtected,
      general,
      hasPermission(["admin", "super_admin"], rolePermissions.DELETE),
      verifyMiddleware.customerIdParamInput,
      controllers.customer.deleteCustomer,
    ],
  },
];

export default serviceLoader;
