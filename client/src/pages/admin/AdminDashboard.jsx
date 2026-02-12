import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLoading } from "../../contexts/LoadingContext";
import {
  UserGroupIcon,
  BuildingStorefrontIcon,
  StarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const { axiosInstance } = useAuth();
  const { showLoading, hideLoading } = useLoading();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    recentUsers: [],
    topRatedStores: [],
  });

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    showLoading();
    setLoading(true);
    setFetchError(null);

    try {
      const usersResponse = await axiosInstance.get("/admin/users");
      const users = usersResponse?.data?.data || [];

      const storesResponse = await axiosInstance.get("/store");
      const stores = storesResponse?.data?.data || [];

      const ratingsResponse = await axiosInstance.get("/rating/count");
      const totalRatings =
        ratingsResponse?.data?.data?.totalStars || 0;

      const recentUsers = [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      const topRatedStores = stores
        .filter((store) => parseFloat(store.averageRating) > 0)
        .sort(
          (a, b) =>
            parseFloat(b.averageRating) -
            parseFloat(a.averageRating)
        )
        .slice(0, 5)
        .map((store) => ({
          name: store.storeName,
          rating: parseFloat(store.averageRating).toFixed(1),
        }));

      setStats({
        totalUsers: users.length,
        totalStores: stores.length,
        totalRatings,
        recentUsers,
        topRatedStores,
      });
    } catch (error) {
      console.error("Dashboard Error:", error);
      setFetchError(
        error.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  const statsCards = [
    {
      name: "Total Users",
      value: stats.totalUsers,
      icon: UserGroupIcon,
      color: "bg-blue-500",
      description: "Registered users",
    },
    {
      name: "Total Stores",
      value: stats.totalStores,
      icon: BuildingStorefrontIcon,
      color: "bg-green-500",
      description: "Active stores",
    },
    {
      name: "Total Ratings",
      value: stats.totalRatings,
      icon: StarIcon,
      color: "bg-yellow-500",
      description: "Total ratings given",
    },
  ];

  const chartData = stats.topRatedStores.map((store) => ({
    name:
      store.name.length > 10
        ? store.name.substring(0, 10) + "..."
        : store.name,
    rating: parseFloat(store.rating),
  }));

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-2 text-sm text-gray-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error Loading Dashboard
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {fetchError}
        </p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Platform statistics overview
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center text-sm"
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white shadow rounded-lg p-6"
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-md ${stat.color}`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Users */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">
            Top Rated Stores
          </h3>
          {chartData.length === 0 ? (
            <div className="text-center text-gray-400">
              No ratings yet
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">
            Recent Users
          </h3>
          {stats.recentUsers.length === 0 ? (
            <div className="text-center text-gray-400">
              No users yet
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stats.recentUsers.map((user) => (
                <li key={user.id} className="py-3">
                  <p className="font-medium">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.email}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
