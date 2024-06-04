import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLazyGetMeQuery, useLoginMutation } from "../api/auth";
import { removeToken, setToken } from "../slices/authSlice";
import { User } from "../types/authTypes";
import { useAppDispatch } from "./hooks";

interface AuthContextType {
  user?: User;
  loading: boolean;
  error?: Error;
  logout: () => void;
  login: (login: string, password: string) => void;
}

export interface Error {
  data: {
    message: string[];
    statusCode: number;
  };
  code: number;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [user, setUser] = useState<User>();
  const [error, setError] = useState<Error>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  const [getUser, data] = useLazyGetMeQuery();
  const [loginHandler] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (error) setError(undefined);
  }, [location.pathname]);

  useEffect(() => {
    try {
      if (localStorage.getItem("auth_token")) {
        getUser().then((user) => setUser(user.data));
      }
    } catch (error) {
    } finally {
      setLoadingInitial(false);
    }
  }, [localStorage.getItem("auth_token")]);

  const login = async (creds: string, password: string) => {
    setLoading(true);
    try {
      const response = await loginHandler({
        email: creds.includes("@") ? creds : undefined,
        phoneNumber: !creds.includes("@") ? creds : undefined,
        password,
      }).unwrap();
      dispatch(setToken(response.accessToken));
      setUser(data.data);
      navigate({
        pathname: "/dashboard",
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    dispatch(removeToken());
    setUser(null);
    navigate("/login");
  };

  const memoedValue = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
    }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={memoedValue}>{!loadingInitial && children}</AuthContext.Provider>;
};

export default function useAuth() {
  return useContext(AuthContext);
}
