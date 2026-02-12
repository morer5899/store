import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error?.explanation || "Login failed",
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/signup", userData);
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error?.explanation || "Signup failed",
      };
    }
  };

  const updatePassword = async (passwordData) => {
    try {
      await axiosInstance.patch("/auth/update-password", passwordData);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error?.explanation || "Password update failed",
      };
    }
  };

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setUser(null);
      setToken(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        logout();
        return;
      }

      setUser(decoded);
      setToken(token);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updatePassword,
    axiosInstance,
    isAdmin: user?.role === "ADMIN",
    isStoreOwner: user?.role === "STORE_OWNER",
    isUser: user?.role === "USER",
    getDefaultRoute: () => {
      if (user?.role === "ADMIN") return "/admin";
      if (user?.role === "STORE_OWNER") return "/store-owner";
      return "/stores";
    },
    canAccessStores: () => user?.role === "USER",
    canAccessAdmin: () => user?.role === "ADMIN",
    canAccessStoreOwner: () => user?.role === "STORE_OWNER",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
