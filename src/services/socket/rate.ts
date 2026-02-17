import { getters } from "../../config";
import { io, Socket } from "socket.io-client";

let rateSocket: Socket;

export const initRateSocket = () => {
  console.log("[Client] Initializing /rate socket...");
  console.log(getters.getAppUrls().WEBSOCKET_URL);
  rateSocket = io(`${getters.getAppUrls().WEBSOCKET_URL}/rate`, {
    transports: ["websocket"],
  });

  rateSocket.on("connect", () => {
    console.log("[Client] Connected to /rate:", rateSocket.id);
    rateSocket.emit("hello", { message: "Hello from client" });
  });

  rateSocket.on("disconnect", () => {
    console.log("[Client] Disconnected from /rate");
  });
};

export const getRateSocket = (): Socket => {
  if (!rateSocket) throw new Error("/rate socket not initialized");
  return rateSocket;
};
