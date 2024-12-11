import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/authContext/authContext";

const GuestRoute = ({ children }) => {
  const { refreshToken } = useContext(AuthContext);

  if (refreshToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
