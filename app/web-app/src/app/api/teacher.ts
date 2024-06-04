import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import { Attendance } from "../types/studentTypes";
import { AddTeacher, Teacher, TeacherFile, TeacherNote, TeacherStudents } from "../types/teacherTypes";

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

export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: baseQuery,
  tagTypes: ["Teachers", "Notes", "Files", "Reminds", "Presence"],
  endpoints: (builder) => ({
    getTeachers: builder.query<Teacher[], { fullName?: string }>({
      query: ({ fullName }) => ({
        url: "/teachers",
        method: "GET",
        params: { fullName },
      }),
      providesTags: ["Teachers"],
    }),
    getTeacherById: builder.query<Teacher, string>({
      query: (id) => ({
        url: `/teachers/${id}`,
        method: "GET",
      }),
    }),
    addTeacher: builder.mutation<Teacher, AddTeacher>({
      query: (body) => ({
        url: "/teachers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Teachers"],
    }),
    deleteTeacher: builder.mutation<void, { id: string }>({
      query: ({ id }) => ({
        url: `/teachers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Teachers"],
    }),
    getTeacherStudents: builder.query<TeacherStudents[], { id: string }>({
      query: ({ id }) => ({
        url: `/teachers/${id}/students`,
        method: "GET",
      }),
    }),
    getTeacherNotes: builder.query<TeacherNote[], { id: string }>({
      query: ({ id }) => ({
        url: `/teachers/${id}/notes`,
        method: "GET",
      }),
      providesTags: ["Notes"],
    }),
    setTeacherNote: builder.mutation<void, { text: string; id: string }>({
      query: ({ id, text }) => ({
        url: `/teachers/${id}/notes`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Notes"],
    }),
    getStudentCount: builder.query<number, { id: string }>({
      query: ({ id }) => ({
        url: `/teachers/${id}/students-number`,
        method: "GET",
      }),
    }),
    uploadTeacherImage: builder.mutation<void, { body: FormData; id: string }>({
      query: ({ body, id }) => ({
        url: `/teachers/${id}/avatar`,
        method: "PUT",
        body,
      }),
    }),
    uploadFile: builder.mutation<void, { body: FormData; id: string }>({
      query: ({ body, id }) => ({
        url: `/teachers/${id}/files`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Files"],
    }),
    getFiles: builder.query<TeacherFile[], { id: string }>({
      query: ({ id }) => ({
        url: `/teachers/${id}/files`,
        method: "GET",
      }),
      providesTags: ["Files"],
    }),
    deleteFile: builder.mutation<void, { teacherId: string; fileId: string }>({
      query: ({ teacherId, fileId }) => ({
        url: `/teachers/${teacherId}/files/${fileId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Files"],
    }),
    markPresence: builder.mutation<void, { studentId: string; classId: string }>({
      query: ({ studentId, classId }) => ({
        url: `/classes/${classId}/students/${studentId}/presence`,
        method: "PUT",
      }),
      invalidatesTags: ["Presence"],
    }),
    unmarkPresence: builder.mutation<void, { studentId: string; classId: string }>({
      query: ({ studentId, classId }) => ({
        url: `/classes/${classId}/students/${studentId}/presence`,
        method: "DELETE",
      }),
      invalidatesTags: ["Presence"],
    }),
    getStudentPresence: builder.query<boolean, { studentId: string; classId: string }>({
      query: ({ studentId, classId }) => ({
        url: `/classes/${classId}/students/${studentId}/presence`,
        method: "GET",
      }),
      providesTags: ["Presence"],
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
  useLazyGetTeachersQuery,
  useLazyGetTeacherByIdQuery,
  useGetTeachersQuery,
  useAddTeacherMutation,
  useDeleteTeacherMutation,
  useLazyGetTeacherStudentsQuery,
  useGetTeacherNotesQuery,
  useSetTeacherNoteMutation,
  useGetStudentCountQuery,
  useUploadTeacherImageMutation,
  useUploadFileMutation,
  useGetFilesQuery,
  useDeleteFileMutation,
  useMarkPresenceMutation,
  useUnmarkPresenceMutation,
  useGetStudentPresenceQuery,
  useGetStudentAttendanceQuery,
} = teacherApi;
