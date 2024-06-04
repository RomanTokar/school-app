import { Box } from "@mantine/core";
import { useEffect, useMemo } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import useAuth from "../../app/hooks/useAuth";
import { AppClasses } from "../../pages/Classes/classes.page";
import { ClassesDashboard } from "../../pages/ClassesDashboard/ClassesDashboard";
import { Dashboard } from "../../pages/Dashboard/dashboard.page";
import { Login } from "../../pages/Login/login.page";
import { Students } from "../../pages/Students/students.page";
import { StudentDetail } from "../../pages/StudentDetail/StudentDetail.page";
import { TeacherDashboard } from "../../pages/TeacherDashboard/teacherDashboard.page";
import { Teachers } from "../../pages/Teachers/teachers.page";
import { AppHeader } from "../Header/Header";
import { ProtectedRoute } from "../ProtectedRoute/ProtectedRoute";

export const Layout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("auth_token")) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [user]);

  const adminRotes = () => (
    <Routes>
      <Route path="/" element={<Navigate to={"/dashboard"} replace />} />
      <Route
        path="/classes"
        element={
          <ProtectedRoute>
            <AppClasses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <ProtectedRoute>
            <StudentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <Teachers />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teachers/:teacherId"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/classes/:classId"
        element={
          <ProtectedRoute>
            <ClassesDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="login" element={user ? <Navigate to={"/"} /> : <Login />} />
    </Routes>
  );

  const teacherRoutes = () => (
    <Routes>
      <Route path="/" element={<Navigate to={"/dashboard"} replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );

  const routes = useMemo(() => (user?.role === "teacher" ? teacherRoutes() : adminRotes()), [user]);

  return (
    <>
      <Box className={"backdrop"} />
      {user && <AppHeader />}
      {routes}
    </>
  );
};
