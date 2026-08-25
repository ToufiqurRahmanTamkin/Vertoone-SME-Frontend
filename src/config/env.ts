const rawServerUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");
const API_SUFFIX = /\/api\/v\d+$/i;

const serverUrl = stripTrailingSlash(rawServerUrl);

export const env = {
  appName: import.meta.env.VITE_APP_NAME || "Vertoone SME",
  nodeEnv: import.meta.env.VITE_NODE_ENV || "development",
  serverUrl,
  apiBaseUrl: API_SUFFIX.test(serverUrl) ? serverUrl : `${serverUrl}/api/v1`,
} as const;

export const isDevelopment = env.nodeEnv === "development";
