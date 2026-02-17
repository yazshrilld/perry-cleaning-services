import { getters } from "../../config";
import { io, Socket } from "socket.io-client";

let notifSocket: Socket;

export const initNotifSocket = () => {
  notifSocket = io(`${getters.getAppUrls().WEBSOCKET_URL}/notifications`, {
    transports: ["websocket"],
  });

  notifSocket.on("connect", () => {
    console.log("[Client] Connected to /notifications:", notifSocket.id);
  });

  notifSocket.on("disconnect", () => {
    console.log("[Client] Disconnected from /notifications");
  });
};

export const getNotifSocket = (): Socket => {
  if (!notifSocket) throw new Error("/notifications socket not initialized");
  return notifSocket;
};


