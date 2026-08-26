const rawServerURL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const NODE_ENV = import.meta.env.VITE_NODE_ENV || "development";
const APP_NAME = import.meta.env.VITE_APP_NAME || "Vertoone SME";
const APP_SHORT_NAME = import.meta.env.VITE_APP_SHORT_NAME || "Vertoone";

const normalizeUrl = (url: string) => url.replace(/\/+$/, "");
const API_SUFFIX_RE = /\/api\/v\d+$/i;

const serverURL = normalizeUrl(rawServerURL);
// VITE_SERVER_URL may be given with or without the API prefix; both resolve to
// the same base so a deployment can configure either.
const apiBaseUrl = API_SUFFIX_RE.test(serverURL) ? serverURL : `${serverURL}/api/v1`;

// The socket server lives on the API origin, never under the /api/v1 prefix.
const socketURL = normalizeUrl(
  import.meta.env.VITE_SOCKET_URL || serverURL.replace(API_SUFFIX_RE, "")
);
const socketPath = import.meta.env.VITE_SOCKET_PATH || "/socket.io";

// A serverless API (Vercel) cannot hold a WebSocket open, so realtime is opt-out
// per deployment; the app falls back to polling whenever it is off.
const socketEnabled = import.meta.env.VITE_SOCKET_ENABLED !== "false";

const envConfig = {
  serverURL,
  apiBaseUrl,
  socketURL,
  socketPath,
  socketEnabled,
  NODE_ENV,
  APP_NAME,
  APP_SHORT_NAME,
};

export default envConfig;
