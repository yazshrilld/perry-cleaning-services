import { routeCreator } from "../utils";

export const urls = {
  health: {
    check: () => routeCreator("check"),
    encrytData: () => routeCreator("encrypt", "post"),
    decryptData: () => routeCreator("decrypt", "post"),
    generateSignature: () => routeCreator("generate-signature", "post"),
  },
  sessions: {
    check: () => routeCreator("check"),
    addSession: () => routeCreator("add", "post"),
    getSessions: () => routeCreator(":conversationId", "get"),
    deleteSession: () => routeCreator(":conversationId", "delete"),
  },
  messages: {
    check: () => routeCreator("check"),
    createMessage: () => routeCreator("save", "post"),
    getMessages: () => routeCreator(":conversationId", "get"),
    updateMessageStatus: () => routeCreator(":messageId", "patch"),
  },
  auth: {
    check: () => routeCreator("check"),
    login: () => routeCreator("login", "post"),
    register: () => routeCreator("register", "post"),
  },
  customer: {
  getCustomers: () => routeCreator("customer", "get"),
  getCustomerById: () => routeCreator("customer/:id", "get"),
  updateCustomer: () => routeCreator("customer/:id", "patch"),
  deleteCustomer: () => routeCreator("customer/:id", "delete"),
},

};
