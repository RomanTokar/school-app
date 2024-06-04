import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import { AddRemind, Notification, Remind } from "../types/global";

const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_BASE_URL}`,

  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || localStorage.getItem("auth_token");

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

export const globalApi = createApi({
  reducerPath: "globalApi",
  baseQuery: baseQuery,
  tagTypes: ["Reminds", "Notifications"],
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => ({
        url: "/notifications",
        method: "GET",
      }),
      providesTags: ["Notifications"],
    }),
    readNotification: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/notifications/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notifications"],
    }),
    addRemind: builder.mutation<void, AddRemind>({
      query: (body) => ({
        url: "/reminds",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reminds"],
    }),
    getReminds: builder.query<Remind[], { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => ({
        url: "/reminds",
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Reminds"],
    }),
    deleteRemind: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/reminds/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reminds"],
    }),
  }),
});

export const { useGetNotificationsQuery, useAddRemindMutation, useGetRemindsQuery, useDeleteRemindMutation, useReadNotificationMutation } = globalApi;
