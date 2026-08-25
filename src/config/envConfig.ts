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

const envConfig = {
  serverURL,
  apiBaseUrl,
  NODE_ENV,
  APP_NAME,
  APP_SHORT_NAME,
};

export default envConfig;
