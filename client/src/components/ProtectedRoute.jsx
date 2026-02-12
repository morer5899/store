import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;

  return <Outlet />;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  if (!user || user.role !== "ADMIN") {
    if (user?.role === "STORE_OWNER") return <Navigate to="/store-owner" />;
    return <Navigate to="/stores" />;
  }

  return children;
};

export const StoreOwnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  if (!user || user.role !== "STORE_OWNER") {
    if (user?.role === "ADMIN") return <Navigate to="/admin" />;
    return <Navigate to="/stores" />;
  }

  return children;
};

export const UserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  if (!user || user.role !== "USER") {
    if (user?.role === "ADMIN") return <Navigate to="/admin" />;
    if (user?.role === "STORE_OWNER") return <Navigate to="/store-owner" />;
    return <Navigate to="/login" />;
  }

  return children;
};
