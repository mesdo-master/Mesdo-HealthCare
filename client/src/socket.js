import { io } from 'socket.io-client';

let socket;

export function initSocket(userId) {
  socket = io('http://localhost:5000', {
    auth: { userId }
  });
  return socket;
}

export function getSocket() {
  return socket;
}
