import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLoading } from "../../contexts/LoadingContext";
import {
  UserGroupIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";

export default function StoreOwnerDashboard() {
  const [totalRatings, setTotalRatings] = useState(0);
  const { user, axiosInstance } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    showLoading();
    setLoading(true);

    try {
      // Fetch owner's store (returns single object)
      const storeResponse = await axiosInstance.get("/store/my-store");
      const ownerStore = storeResponse.data.data;

      if (ownerStore) {
        setStore(ownerStore);
        try {
          const ratingsResponse = await axiosInstance.get(
            `/rating/${ownerStore.id}`,
          );
          setRatings(ratingsResponse.data.data || []);
        } catch (ratingError) {
          console.error("Error fetching ratings:", ratingError);
          setRatings([]);
        }

        // Fetch average rating
        try {
          const avgResponse = await axiosInstance.get(
            `/rating/${ownerStore.id}/avg`,
          );

          const avgData = avgResponse.data.data;

          if (typeof avgData === "string") {
            setAverageRating(parseFloat(avgData) || 0);
          } else if (typeof avgData === "number") {
            setAverageRating(avgData);
          } else if (avgData?.averageRating) {
            setAverageRating(parseFloat(avgData.averageRating) || 0);
          } else {
            setAverageRating(0);
          }
        } catch (avgError) {
          console.error("Error fetching average rating:", avgError);
          setAverageRating(0);
        }

        // Fetch total ratings count
        try {
          const totalResponse = await axiosInstance.get(
            `/rating/${ownerStore.id}/total`,
          );

          const totalData = totalResponse.data.data;
          setTotalRatings(totalData || 0);
        } catch (totalError) {
          console.error("Error fetching total ratings:", totalError);
          setTotalRatings(0);
        }
      } else {
        setStore(null);
      }
    } catch (error) {
      console.error("Error fetching store data:", error);
      setStore(null);
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  const statsCards = [
    {
      name: "Total Ratings",
      value: totalRatings,
      icon: StarIcon,
      color: "bg-yellow-500",
    },

    {
      name: "Average Rating",
      value: parseFloat(averageRating).toFixed(1),
      icon: ArrowTrendingUpIcon,
      color: "bg-green-500",
    },
    {
      name: "Unique Raters",
      value: ratings.length,
      icon: UserGroupIcon,
      color: "bg-blue-500",
    },
  ];

  const recentRatings = ratings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Function to render stars
  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${i < count ? "text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">
        Store Owner Dashboard
      </h1>
      <p className="mt-1 text-sm text-gray-600">
        Manage your store and view ratings
      </p>

      {store ? (
        <>
          {/* Store Info */}
          <div className="mt-8 rounded-lg bg-white shadow p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <BuildingStorefrontIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {store.storeName}
                    </h2>
                    <p className="text-sm text-gray-600">{store.email}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">{store.address}</p>
              </div>
              <div className="text-center md:text-right">
                <div className="flex items-center justify-center md:justify-end mb-2">
                  <div className="flex">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="ml-2 text-3xl font-bold text-primary-600">
                    {parseFloat(averageRating).toFixed(1)}
                  </span>
                  <span className="ml-1 text-sm text-gray-500">/5</span>
                </div>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {statsCards.map((stat) => (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
              >
                <dt>
                  <div className={`absolute rounded-md ${stat.color} p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="ml-16 truncate text-sm font-medium text-gray-500">
                    {stat.name}
                  </p>
                </dt>
                <dd className="ml-16 flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                </dd>
              </div>
            ))}
          </div>

          {/* Recent Ratings */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Ratings
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Latest feedback from customers
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {ratings.length === 0 ? (
                <div className="text-center py-12">
                  <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No ratings yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your store hasn't received any ratings yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flow-root">
                    <ul className="-my-5 divide-y divide-gray-200">
                      {recentRatings.map((rating) => (
                        <li key={rating.id} className="py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {rating.user?.name?.charAt(0) || "A"}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {rating.user?.name || "Anonymous User"}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {rating.user?.email || "No email provided"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(
                                    rating.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="flex">
                                {renderStars(rating.stars)}
                              </div>
                              <span className="ml-2 text-sm font-medium text-gray-900">
                                {rating.stars}/5
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {ratings.length > 5 && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => {
                          /* Add view all functionality */
                        }}
                        className="text-sm text-primary-600 hover:text-primary-500"
                      >
                        View all {ratings.length} ratings
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-8 bg-white rounded-lg shadow p-8 text-center">
          <BuildingStorefrontIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No store registered
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            You don't have a store registered yet. Please contact an
            administrator to set up your store.
          </p>
          <div className="mt-6">
            <button
              onClick={fetchStoreData}
              className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
