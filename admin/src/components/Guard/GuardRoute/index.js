import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext/authContext";

function GuardRoute({ children }) {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default GuardRoute;
