const rawServerURL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
const NODE_ENV = import.meta.env.VITE_NODE_ENV || "development";
const APP_NAME = import.meta.env.VITE_APP_NAME || "Vertoone SME";
const APP_SHORT_NAME = import.meta.env.VITE_APP_SHORT_NAME || "Vertoone";

const normalizeUrl = (url: string) => url.replace(/\/+$/, "");
const API_SUFFIX_RE = /\/api\/v\d+$/i;

const serverURL = normalizeUrl(rawServerURL);
const apiBaseUrl = API_SUFFIX_RE.test(serverURL) ? serverURL : `${serverURL}/api/v1`;

const socketURL = normalizeUrl(
  import.meta.env.VITE_SOCKET_URL || serverURL.replace(API_SUFFIX_RE, "")
);
const socketPath = import.meta.env.VITE_SOCKET_PATH || "/socket.io";

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
