import { initRateSocket } from "./rate";
import { initNotifSocket } from "./notification";

export const initAllSockets = () => {
  initRateSocket();
  initNotifSocket();
};
