import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FullPageSpinner } from "../ui/Spinner";

export function ProtectedRoute() {
  const { user, loading, exitTo } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  // signed out on purpose → go where sign-out asked; otherwise ask them to log in and come back here
  if (!user) {
    return exitTo ? (
      <Navigate to={exitTo} replace />
    ) : (
      <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    );
  }
  return <Outlet />;
}

// Keeps signed-in users out of /login and /register
export function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/app" replace />;
  return <Outlet />;
}
