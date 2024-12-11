// components/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/authContext/authContext";

const GuardRoute = ({ children }) => {
  const { refreshToken } = useContext(AuthContext);

  if (!refreshToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default GuardRoute;
