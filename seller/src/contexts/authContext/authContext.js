import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(Cookies.get("SAT") || null);
  const [refreshToken, setRefreshToken] = useState(Cookies.get("SRT") || null);

  useEffect(() => {
    const storedAccessToken = Cookies.get("SAT");
    const storedRefreshToken = Cookies.get("SRT");

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
