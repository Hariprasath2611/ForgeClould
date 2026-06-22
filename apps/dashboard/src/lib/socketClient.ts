import { io, Socket } from 'socket.io-client';

class SocketConnectionManager {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      const token = localStorage.getItem('access_token');
      this.socket = io(import.meta.env.VITE_WS_URL || '/', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected');
      });

      this.socket.on('disconnect', () => {
        console.warn('[Socket] Disconnected');
      });
    }
    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketManager = new SocketConnectionManager();
