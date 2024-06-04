import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import { AddClass, City, Classes, Matnas, UpdateClass } from "../types/classesTypes";
import { Note, Student, StudentFile } from "../types/studentTypes";

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

export const classesApi = createApi({
  reducerPath: "classesApi",
  baseQuery: baseQuery,
  tagTypes: ["Classes", "Students", "Notes", "Files"],
  endpoints: (builder) => ({
    getClasses: builder.query<Classes[], { name?: string; startDate?: string; endDate?: string; teacherId?: string }>({
      query: ({ name, startDate, endDate, teacherId }) => ({
        url: "/classes",
        method: "GET",
        params: { name, startDate, endDate, teacherId },
      }),
      providesTags: ["Classes"],
    }),
    getClass: builder.query<Classes, { id: string }>({
      query: ({ id }) => ({
        url: `/classes/${id}`,
        method: "GET",
      }),
      providesTags: ["Classes"],
    }),
    addClass: builder.mutation<void, AddClass>({
      query: (body) => ({
        url: "/classes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Classes"],
    }),
    getMatnas: builder.query<Matnas[], void>({
      query: () => ({
        url: "/matnases",
        method: "GET",
      }),
    }),
    getCity: builder.query<City[], void>({
      query: () => ({
        url: "/cities",
        method: "GET",
      }),
    }),
    deleteClass: builder.mutation<void, { id: string; deleteType?: string; recurringEndDate?: string }>({
      query: ({ id, deleteType, recurringEndDate }) => ({
        url: `/classes/${id}`,
        method: "DELETE",
        body: { deleteType, recurringEndDate },
      }),
      invalidatesTags: ["Classes"],
    }),
    updateClass: builder.mutation<void, UpdateClass>({
      query: (body) => ({
        url: `/classes/${body._id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Classes"],
    }),
    putStudentIntoClass: builder.mutation<void, { studentId: string; classId: string; updateType?: string; recurringEndDate?: string }>({
      query: ({ studentId, classId, updateType, recurringEndDate }) => ({
        url: `/classes/${classId}/students/${studentId}`,
        method: "PUT",
        body: { updateType, recurringEndDate },
      }),
      invalidatesTags: ["Students"],
    }),
    deleteStudentFromClass: builder.mutation<void, { studentId: string; classId: string; deleteType?: string }>({
      query: ({ studentId, classId, deleteType }) => ({
        url: `/classes/${classId}/students/${studentId}`,
        method: "DELETE",
        body: { deleteType },
      }),
      invalidatesTags: ["Students"],
    }),
    getClassStudents: builder.query<Student[], { classId: string }>({
      query: ({ classId }) => ({
        url: `/classes/${classId}/students`,
        method: "GET",
      }),
      providesTags: ["Students"],
    }),
    getNotes: builder.query<Note[], { id: string }>({
      query: ({ id }) => ({
        url: `/classes/${id}/notes`,
        method: "GET",
      }),
      providesTags: ["Notes"],
    }),
    setNote: builder.mutation<void, { id: string; text: string; updateType?: string; recurringEndDate?: string }>({
      query: ({ text, id, updateType, recurringEndDate }) => ({
        url: `/classes/${id}/notes`,
        method: "POST",
        body: { text, updateType, recurringEndDate },
      }),
      invalidatesTags: ["Notes"],
    }),
    deleteNote: builder.mutation<void, { classId: string; noteId: string; deleteType?: string; recurringEndDate?: string }>({
      query: ({ classId, noteId, deleteType, recurringEndDate }) => ({
        url: `/classes/${classId}/notes/${noteId}`,
        method: "DELETE",
        body: { deleteType, recurringEndDate },
      }),
      invalidatesTags: ["Notes"],
    }),
    getFiles: builder.query<StudentFile[], { id: string }>({
      query: ({ id }) => ({
        url: `/classes/${id}/files`,
        method: "GET",
      }),
      providesTags: ["Files"],
    }),
    uploadFile: builder.mutation<void, { body: FormData; id: string; updateType?: string; recurringEndDate?: string }>({
      query: ({ id, body }) => ({
        url: `/classes/${id}/files`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Files"],
    }),
    deleteFile: builder.mutation<void, { classId: string; fileId: string; deleteType?: string; recurringEndDate?: string }>({
      query: ({ classId, fileId, deleteType, recurringEndDate }) => ({
        url: `/classes/${classId}/files/${fileId}`,
        method: "DELETE",
        body: { deleteType, recurringEndDate },
      }),
      invalidatesTags: ["Files"],
    }),
    getClassesStudentsPresence: builder.query<{ present: number; absent: number }, { startDate: string; endDate: string }>({
      query: ({ startDate, endDate }) => ({
        url: "/classes/students/presence",
        params: { startDate, endDate },
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetClassesQuery,
  useLazyGetClassesQuery,
  useAddClassMutation,
  useGetMatnasQuery,
  useGetCityQuery,
  useDeleteClassMutation,
  useUpdateClassMutation,
  useGetClassQuery,
  usePutStudentIntoClassMutation,
  useGetClassStudentsQuery,
  useDeleteStudentFromClassMutation,
  useGetNotesQuery,
  useSetNoteMutation,
  useGetFilesQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
  useGetClassesStudentsPresenceQuery,
  useDeleteNoteMutation,
} = classesApi;
