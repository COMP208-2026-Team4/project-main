import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser, selectAuthLoading } from "../store/auth";

/**
 * Wraps routes that require authentication.
 * Redirects to /login if no user is in the Redux store.
 * Shows nothing while the initial /users/me fetch is in flight.
 */
const ProtectedRoute: React.FC = () => {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
