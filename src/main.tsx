import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App";
import "./index.css";
import { persistor, store } from "./redux/store";

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element "#root" is missing from index.html');
}

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      {/* Hold rendering until the persisted session is rehydrated, or the route
          guards would bounce a signed-in user to /login on every reload. */}
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
