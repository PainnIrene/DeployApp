import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(false);

  // Kiểm tra cookie ART khi khởi động
  useEffect(() => {
    const cookies = document.cookie.split(";");
    const hasART = cookies.some((cookie) => cookie.trim().startsWith("ART="));
    setAccessToken(hasART);
  }, []);

  // Xử lý response error
  useEffect(() => {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Xóa cookies
          document.cookie = "AAT=; Max-Age=0; path=/;";
          document.cookie = "ART=; Max-Age=0; path=/;";
          setAccessToken(false);
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        "http://localhost:3001/admin/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.message === "Login successful") {
        setAccessToken(true);
        return { success: true, data: response.data };
      }
      return { success: false, error: "Login failed" };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:3001/admin/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setAccessToken(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Logout failed" };
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
