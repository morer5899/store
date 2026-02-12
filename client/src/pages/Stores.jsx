import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { ratingAPI } from "../services/api";
import StoreCard from "../components/StoreCard";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingStorefrontIcon,
  StarIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "react-router-dom";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Stores() {
  const { axiosInstance, isStoreOwner, isUser } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);

  const [stores, setStores] = useState([]);
  const [userStats, setUserStats] = useState({ totalRatings: 0, ratings: 0 });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const initialFilterType = searchParams.has("address")
    ? "address"
    : "name";

  const [filterType, setFilterType] = useState(initialFilterType);

  const [searchInput, setSearchInput] = useState(
    searchParams.get("name") || searchParams.get("address") || ""
  );

  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("order") || "DESC";

  const debouncedSearch = useDebounce(searchInput, 500);

  const buildParams = useCallback(
    ({ field = sortBy, order = sortOrder, search = searchInput, type = filterType }) => {
      const params = new URLSearchParams();

      if (search) {
        params.set(type, search);
      }

      if (field) params.set("sortBy", field);
      if (order) params.set("order", order);

      return params;
    },
    [filterType, sortBy, sortOrder, searchInput]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSearchParams(
      buildParams({ search: debouncedSearch, type: filterType })
    );
  }, [debouncedSearch, filterType, buildParams, setSearchParams]);

  const searchTerm =
    searchParams.get("name") || searchParams.get("address") || "";

  useEffect(() => {
    fetchStores();
    if (isUser) fetchUserStats();
  }, [searchTerm, sortBy, sortOrder, isUser]);

  const fetchStores = async () => {
    showLoading();
    setLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams(searchParams);
      const query = params.toString();
      const url = query ? `/store?${query}` : "/store";

      const response = await axiosInstance.get(url);
      const allStores = isStoreOwner ? [] : response.data.data || [];
      setStores(allStores);
    } catch (error) {
      if (error.response?.status === 404) {
        setStores([]);
        setFetchError(null);
      } else {
        setFetchError(
          error.response?.data?.error?.explanation ||
            "Failed to load stores. Please try again."
        );
        setStores([]);
      }
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await ratingAPI.getUserRatings();
      const userRatings = response.data.data || [];
      if (!userRatings.length) {
        setUserStats({ totalRatings: 0, ratings: 0 });
        return;
      }
      const total = userRatings.reduce((sum, r) => sum + r.stars, 0);
      setUserStats({
        totalRatings: userRatings.length,
        ratings: (total / userRatings.length).toFixed(1),
      });
    } catch {}
  };

  const handleSearchChange = (e) => setSearchInput(e.target.value);

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setSearchParams(
      buildParams({
        search: searchInput,
        type: e.target.value,
      })
    );
  };

  const handleSort = (field) => {
    const newOrder =
      sortBy === field ? (sortOrder === "ASC" ? "DESC" : "ASC") : sortOrder;

    setSearchParams(buildParams({ field, order: newOrder }));
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilterType("name");
    setSearchParams({});
  };

  if (isStoreOwner) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-red-400" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Access Denied
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Store owners cannot access the stores page. Please use your store
          dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and rate stores in your area
          </p>
        </div>

        {userStats.totalRatings > 0 && (
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <div className="flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {userStats.ratings}
              </span>
              <span className="text-sm text-gray-500 ml-1">avg rating</span>
            </div>
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-1" />
              <span className="text-sm font-medium text-gray-900">
                {userStats.totalRatings}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                stores rated
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="rounded-lg bg-white shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2 w-full">
                <select
                  value={filterType}
                  onChange={handleFilterTypeChange}
                  className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="name">Name</option>
                  <option value="address">Address</option>
                </select>

                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2"
                    placeholder={`Search by ${filterType}...`}
                  />
                  {searchInput !== searchTerm && searchInput && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary-600"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="createdAt">Date</option>
                  <option value="storeName">Store Name</option>
                  <option value="address">Address</option>
                  <option value="ratings">Rating</option>
                </select>

                <button
                  onClick={() => handleSort(sortBy)}
                  className="inline-flex items-center p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sortOrder === "ASC" ? (
                    <ArrowUpIcon className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading stores...</p>
            </div>
          ) : fetchError ? (
            <div className="p-8 text-center">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Error Loading Stores
              </h3>
              <p className="mt-1 text-sm text-gray-500">{fetchError}</p>
              <button
                onClick={fetchStores}
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Try Again
              </button>
            </div>
          ) : stores.length === 0 ? (
            <div className="p-8 text-center">
              <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No stores found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? `No stores found matching "${searchTerm}"`
                  : "No stores available at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 sm:gap-5 sm:p-5 md:gap-6 md:p-6">
              {stores.map((store) => (
                <div key={store.id} className="w-full">
                  <StoreCard
                    store={store}
                    onRatingSubmit={fetchUserStats}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}