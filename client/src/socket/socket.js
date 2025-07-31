import io from "socket.io-client";

let socket;

export function initSocket(userId) {
  socket = io(
    process.env.REACT_APP_SOCKET_URL ||
      "https://mesdo-healthcare-4.onrender.com/",
    {
      auth: { userId },
    }
  );
  return socket;
}

export function getSocket() {
  return socket;
}
