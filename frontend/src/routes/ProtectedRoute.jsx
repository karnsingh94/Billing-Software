import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
 const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    return <Navigate to="/" />;
  }

  if (user.role?.toLowerCase() !== allowedRole.toLowerCase()) {
  return <Navigate to="/" replace />;
}

  return children;
}

export default ProtectedRoute