import React, { createContext, useState, useEffect, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("userData");
    return storedUser
      ? JSON.parse(storedUser)
      : { username: "", name: "", avatarUrl: "" };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("userData");
      setUser(
        storedUser
          ? JSON.parse(storedUser)
          : { username: "", name: "", avatarUrl: "" }
      );
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateUser = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("userData", JSON.stringify(newUserData));
  };
  const clearUser = () => {
    setUser(null);
    localStorage.removeItem("userData");
  };

  return (
    <UserContext.Provider value={{ user, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
