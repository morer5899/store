import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import { ProtectedRoute, AdminRoute, StoreOwnerRoute, UserRoute } from "./components/ProtectedRoute";
import { Suspense, lazy } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

// Lazy-loaded pages
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Stores = lazy(() => import("./pages/Stores"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminStores = lazy(() => import("./pages/admin/AdminStores"));
const StoreOwnerDashboard = lazy(() => import("./pages/store-owner/StoreOwnerDashboard"));

// Home redirect checks token expiration
const HomeRedirect = () => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }

    const role = payload.role;
    if (role === "ADMIN") return <Navigate to="/admin" />;
    if (role === "STORE_OWNER") return <Navigate to="/store-owner" />;
    return <Navigate to="/stores" />;
  } catch {
    return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <Router>
      <LoadingProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/profile" element={<Profile />} />

                  {/* User routes */}
                  <Route
                    path="/stores"
                    element={
                      <UserRoute>
                        <Stores />
                      </UserRoute>
                    }
                  />

                  {/* Admin routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/stores"
                    element={
                      <AdminRoute>
                        <AdminStores />
                      </AdminRoute>
                    }
                  />

                  {/* Store owner routes */}
                  <Route
                    path="/store-owner"
                    element={
                      <StoreOwnerRoute>
                        <StoreOwnerDashboard />
                      </StoreOwnerRoute>
                    }
                  />
                </Route>
              </Route>

              {/* Default route */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<HomeRedirect />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </LoadingProvider>
    </Router>
  );
}

export default App;
