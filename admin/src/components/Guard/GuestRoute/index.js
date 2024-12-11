import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/authContext/authContext";

function GuestRoute({ children }) {
  const { accessToken } = useAuth();

  if (accessToken) {
    return <Navigate to="/" />;
  }

  return children;
}

export default GuestRoute;
