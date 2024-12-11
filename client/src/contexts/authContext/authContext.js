import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(Cookies.get("AT") || null);
  const [refreshToken, setRefreshToken] = useState(Cookies.get("RT") || null);

  useEffect(() => {
    const storedAccessToken = Cookies.get("AT");
    const storedRefreshToken = Cookies.get("RT");

    if (storedAccessToken && storedRefreshToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, refreshToken, setAccessToken, setRefreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};
