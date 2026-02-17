import { getters } from "../../config";
import { io, Socket } from "socket.io-client";

let walletSocket: Socket;

export const initWalletSocket = () => {
  console.log("[Client] Initializing /wallet socket...");
  console.log(getters.getAppUrls().WEBSOCKET_URL);
  walletSocket = io(`${getters.getAppUrls().WEBSOCKET_URL}/wallet`, {
    transports: ["websocket"],
  });

  walletSocket.on("connect", () => {
    console.log("[Client] Connected to /wallet:", walletSocket.id);
    walletSocket.emit("hello", { message: "Hello from client" });
  });

  walletSocket.on("disconnect", () => {
    console.log("[Client] Disconnected from /wallet");
  });
};

export const getWalletSocket = (): Socket => {
  if (!walletSocket) throw new Error("/wallet socket not initialized");
  return walletSocket;
};
