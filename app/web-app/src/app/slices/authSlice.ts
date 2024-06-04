import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store/store";

interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("auth_token", action.payload);
    },
    removeToken: (state) => {
      state.token = null;
      localStorage.removeItem("auth_token");
    },
  },
});

export const { setToken, removeToken } = authSlice.actions;

export const appAuth = (state: RootState) => state.auth;

export default authSlice.reducer;
