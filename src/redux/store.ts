import { combineReducers, configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer, { logOut, setCredentials } from "./authSlice";
import { baseApi } from "./baseApi";
import settingsReducer from "./settingsSlice";

const rootPersistConfig = {
  key: "vertoone-omni",
  storage,
  whitelist: ["auth", "settings"],
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: authReducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

const sessionListener = createListenerMiddleware();

sessionListener.startListening({
  actionCreator: logOut,
  effect: (_action, listenerApi) => {
    listenerApi.dispatch(baseApi.util.resetApiState());
  },
});

sessionListener.startListening({
  actionCreator: setCredentials,
  effect: (action, listenerApi) => {
    const previous = (listenerApi.getOriginalState() as { auth: { user: { _id: string } | null } })
      .auth.user;
    if (previous && previous._id !== action.payload.user._id) {
      listenerApi.dispatch(baseApi.util.resetApiState());
    }
  },
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .prepend(sessionListener.middleware)
      .concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);
