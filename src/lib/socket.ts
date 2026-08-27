import envConfig from "@/config/envConfig";
import type {
  ClientToServerEvents,
  RealtimeStatus,
  ServerToClientEvents,
} from "@/types/domain/realtime";
import { io, type Socket } from "socket.io-client";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const RECONNECT_DELAY_MS = 1_000;
const RECONNECT_DELAY_MAX_MS = 15_000;

let socket: AppSocket | null = null;
let currentToken: string | null = null;

const listeners = new Set<() => void>();
let status: RealtimeStatus = envConfig.socketEnabled ? "DISCONNECTED" : "DISABLED";

const setStatus = (next: RealtimeStatus): void => {
  if (status === next) return;
  status = next;
  listeners.forEach((listener) => listener());
};

export const subscribeToSocketStatus = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getSocketStatus = (): RealtimeStatus => status;

export const isRealtimeConfigured = (): boolean => envConfig.socketEnabled;

export const getSocket = (): AppSocket | null => socket;

const bindStatusEvents = (instance: AppSocket): void => {
  instance.on("connect", () => setStatus("CONNECTED"));
  instance.on("disconnect", () => setStatus("DISCONNECTED"));
  instance.on("connect_error", () => setStatus("DISCONNECTED"));
  instance.io.on("reconnect_attempt", () => setStatus("CONNECTING"));
};

export const connectSocket = (token: string): AppSocket | null => {
  if (!envConfig.socketEnabled || !token) return null;

  if (socket) {
    if (currentToken === token) return socket;

    currentToken = token;
    socket.auth = { token };
    setStatus("CONNECTING");
    socket.disconnect().connect();
    return socket;
  }

  currentToken = token;
  setStatus("CONNECTING");

  socket = io(envConfig.socketURL, {
    path: envConfig.socketPath,
    auth: { token },
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionDelay: RECONNECT_DELAY_MS,
    reconnectionDelayMax: RECONNECT_DELAY_MAX_MS,
    reconnectionAttempts: Infinity,
    timeout: 10_000,
    autoConnect: true,
  });

  bindStatusEvents(socket);

  return socket;
};

export const disconnectSocket = (): void => {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  currentToken = null;
  setStatus(envConfig.socketEnabled ? "DISCONNECTED" : "DISABLED");
};
