import { io } from "socket.io-client";

let socket;

export function initSocket(userId) {
  socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5020", {
    auth: { userId },
  });
  return socket;
}

export function getSocket() {
  return socket;
}
