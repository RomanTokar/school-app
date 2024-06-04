import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import { School } from "../types/schoolsTypes";

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

export const schoolsApi = createApi({
  reducerPath: "schoolsApi",
  baseQuery: baseQuery,
  tagTypes: ["Schools"],
  endpoints: (builder) => ({
    getSchools: builder.query<School[], void>({
      query: () => ({
        url: `/schools`,
        method: "GET",
      }),
      providesTags: ["Schools"],
    }),
  }),
});

export const { useGetSchoolsQuery } = schoolsApi;
