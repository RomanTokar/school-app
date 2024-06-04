import { FC } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../app/hooks/useAuth";

export const ProtectedRoute: FC<{ children: JSX.Element }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to={"/login"} replace />;
  } else {
    return children;
  }
};
