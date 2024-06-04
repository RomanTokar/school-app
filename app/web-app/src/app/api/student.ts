import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import { AddStudent, Attendance, Note, Student, StudentFile, Сlass } from "../types/studentTypes";

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

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: baseQuery,
  tagTypes: ["Students", "Student", "Notes", "Classes", "Files", "Presence"],
  endpoints: (builder) => ({
    getStudents: builder.query<Student[], { fullName?: string; city?: string; school?: string; matnas?: string }>({
      query: ({ fullName, city, school, matnas }) => ({
        url: "/students",
        method: "GET",
        params: { fullName, city, school, matnas },
      }),
      providesTags: ["Students"],
    }),
    getStudentById: builder.query<Student, { id: string }>({
      query: ({ id }) => ({
        url: `/students/${id}`,
        method: "GET",
        params: { id },
      }),
      providesTags: ["Student"],
    }),
    updateStudent: builder.mutation<AddStudent, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/students/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Student"],
    }),
    updateStudentAvatar: builder.mutation<void, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/students/${id}/avatar`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Student"],
    }),
    deleteStudentAvatar: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/students/${id}/avatar`,
        method: "DELETE",
      }),
      invalidatesTags: ["Student"],
    }),
    addStudent: builder.mutation<Student, AddStudent>({
      query: (body) => ({
        url: "/students",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
    }),
    getStudentNotes: builder.query<Note[], { id: string }>({
      query: ({ id }) => ({
        url: `/students/${id}/notes`,
        method: "GET",
      }),
      providesTags: ["Notes"],
    }),
    addStudentNote: builder.mutation<void, { id: string; text: string }>({
      query: ({ id, text }) => ({
        url: `/students/${id}/notes`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Notes"],
    }),
    deleteStudentNote: builder.mutation<void, { studentId: string; noteId: string }>({
      query: ({ studentId, noteId }) => ({
        url: `/students/${studentId}/notes/${noteId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notes"],
    }),
    deleteStudent: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/students/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Students"],
    }),
    getStudentClasses: builder.query<Сlass[], { id: string; name?: string }>({
      query: ({ id, name }) => ({
        url: `/students/${id}/classes`,
        method: "GET",
        params: { name },
      }),
      providesTags: ["Classes"],
    }),
    updateStudentClass: builder.mutation<void, { id: string; teacherId: string }>({
      query: ({ id, teacherId }) => ({
        url: `/classes/${id}`,
        method: "PATCH",
        body: { teacherId },
      }),
      invalidatesTags: ["Classes"],
    }),
    deleteStudentClass: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/classes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Classes"],
    }),
    getFiles: builder.query<StudentFile[], { id: string }>({
      query: ({ id }) => ({
        url: `/students/${id}/files`,
        method: "GET",
      }),
      providesTags: ["Files"],
    }),
    uploadFile: builder.mutation<void, { body: FormData; id: string }>({
      query: ({ body, id }) => ({
        url: `/students/${id}/files`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Files"],
    }),
    deleteFile: builder.mutation<void, { studentId: string; fileId: string }>({
      query: ({ studentId, fileId }) => ({
        url: `/students/${studentId}/files/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
    getStudentAttendance: builder.query<Attendance, { studentId: string; startDate: string; endDate: string }>({
      query: ({ studentId, startDate, endDate }) => ({
        url: `/students/${studentId}/presence`,
        method: "GET",
        params: { startDate, endDate },
      }),
      providesTags: ["Presence"],
    }),
  }),
});

export const {
  useLazyGetStudentsQuery,
  useGetStudentsQuery,
  useGetStudentNotesQuery,
  useAddStudentNoteMutation,
  useDeleteStudentNoteMutation,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
  useUpdateStudentAvatarMutation,
  useDeleteStudentAvatarMutation,
  useAddStudentMutation,
  useDeleteStudentMutation,
  useGetStudentClassesQuery,
  useUpdateStudentClassMutation,
  useDeleteStudentClassMutation,
  useUploadFileMutation,
  useGetFilesQuery,
  useDeleteFileMutation,
  useGetStudentAttendanceQuery,
} = studentApi;
