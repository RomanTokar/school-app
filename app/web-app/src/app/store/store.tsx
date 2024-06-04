import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import { authApi } from "../api/auth";
import { classesApi } from "../api/classes";
import { globalApi } from "../api/global";
import { schoolsApi } from "../api/schools";
import { studentApi } from "../api/student";
import { teacherApi } from "../api/teacher";
import authReducer from "../slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [classesApi.reducerPath]: classesApi.reducer,
    [schoolsApi.reducerPath]: schoolsApi.reducer,
    [globalApi.reducerPath]: globalApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      teacherApi.middleware,
      classesApi.middleware,
      studentApi.middleware,
      schoolsApi.middleware,
      globalApi.middleware
    ),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
