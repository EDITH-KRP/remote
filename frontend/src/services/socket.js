/**
 * socket.js
 * Single shared Socket.IO client instance for the whole frontend app.
 * Import `socket` anywhere to listen/emit events.
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL
  || import.meta.env.VITE_API_URL?.replace('/api', '')
  || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
});

export default socket;
