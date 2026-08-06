import { io } from 'socket.io-client';
import { getAccessToken } from './apiClient';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export function connectSocket() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection failed:', error.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToNotification(callback) {
  const activeSocket = connectSocket();

  if (!activeSocket) {
    return () => {};
  }

  activeSocket.on('notification:new', callback);

  return () => {
    activeSocket.off('notification:new', callback);
  };
}