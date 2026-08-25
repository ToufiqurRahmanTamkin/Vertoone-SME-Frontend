import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types";
import type { RootState } from "./store";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      {
        payload,
      }: PayloadAction<{
        user: AuthUser;
        accessToken: string;
        refreshToken?: string;
      }>
    ) => {
      state.user = payload.user;
      state.token = payload.accessToken;
      if (payload.refreshToken) {
        state.refreshToken = payload.refreshToken;
      }
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
    },
  },
});

export const { setCredentials, setUser, logOut } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => Boolean(state.auth.token);
