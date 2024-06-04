import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import { AuthGetToken, AuthPostData, User } from "../types/authTypes";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_BASE_URL}`,

  prepareHeaders: (headers, { getState }) => {
    headers.set("content-type", "application/json");
    const token = (getState() as RootState).auth.token || localStorage.getItem("auth_token");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    login: builder.mutation<AuthGetToken, AuthPostData>({
      query: (body) => ({
        url: `/auth/sign-in`,
        method: "POST",
        body,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => ({
        url: "/me",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useLazyGetMeQuery } = authApi;
