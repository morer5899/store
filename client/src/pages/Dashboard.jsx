import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import { Link } from 'react-router-dom';
import { 
  BuildingStorefrontIcon, 
  StarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user, axiosInstance, isAdmin, isStoreOwner } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [stats, setStats] = useState({
    totalStores: 0,
    userRatingCount: 0,
    recentStores: [],
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    showLoading();
    try {
      // Fetch stores
      const storesResponse = await axiosInstance.get('/store');
      const stores = storesResponse.data.data || [];
      
      // Fetch user's ratings
      let userRatings = [];
      try {
        const ratingsResponse = await axiosInstance.get('/rating');
        userRatings = ratingsResponse.data.data || [];
      } catch (error) {
        // User may not have any ratings yet
        console.log('No ratings found for user');
      }
      
      // Get recent stores (limit to 3)
      const recentStores = stores.slice(0, 3);
      
      setStats({
        totalStores: stores.length,
        userRatingCount: userRatings.length,
        recentStores,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      hideLoading();
    }
  };

  // Show different content based on role
  const renderRoleSpecificContent = () => {
    if (isAdmin) {
      return (
        <div className="rounded-lg bg-blue-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <BuildingStorefrontIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Admin Access</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>You have administrator privileges. Access the admin dashboard for full control.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isStoreOwner) {
      return (
        <div className="rounded-lg bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <BuildingStorefrontIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Store Owner Access</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Manage your store and view ratings from the store owner dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-600">
        Welcome back, {user?.name}!
      </p>

      {renderRoleSpecificContent()}

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
          <dt>
            <div className="absolute rounded-md bg-blue-500 p-3">
              <BuildingStorefrontIcon className="h-6 w-6 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              Total Stores
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.totalStores}</p>
            <p className="ml-2 text-sm text-gray-500">available stores</p>
          </dd>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
          <dt>
            <div className="absolute rounded-md bg-yellow-500 p-3">
              <StarIcon className="h-6 w-6 text-white" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              Your Ratings
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stats.userRatingCount}</p>
            <p className="ml-2 text-sm text-gray-500">stores rated</p>
          </dd>
        </div>
      </div>

      {/* Recent Stores */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recent Stores</h3>
          <Link
            to="/stores"
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all stores
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.recentStores.map((store) => (
            <div key={store.id} className="rounded-lg bg-white p-4 shadow border border-gray-200">
              <h4 className="font-medium text-gray-900">{store.storeName}</h4>
              <p className="mt-1 text-sm text-gray-500 truncate">{store.address}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-sm font-medium text-gray-900">
                    {parseFloat(store.averageRating || 0).toFixed(1)}
                  </span>
                </div>
                <Link
                  to={`/stores`}
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}