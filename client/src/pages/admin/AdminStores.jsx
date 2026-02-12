import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BuildingStorefrontIcon,
  StarIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router-dom';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminStores() {
  const { axiosInstance } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [searchInput, setSearchInput] = useState(
    searchParams.get('name') || searchParams.get('address') || searchParams.get('email') || ''
  );
  const [filterType, setFilterType] = useState(
    searchParams.has('name') ? 'name' : 
    searchParams.has('address') ? 'address' : 
    searchParams.has('email') ? 'email' : 'name'
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'DESC');

  const debouncedSearch = useDebounce(searchInput, 500);

  const buildParams = useCallback(({ search = searchInput, type = filterType, field = sortBy, order = sortOrder }) => {
    const params = new URLSearchParams();
    if (search) params.set(type, search);
    if (field) params.set('sortBy', field);
    if (order) params.set('order', order);
    return params;
  }, [searchInput, filterType, sortBy, sortOrder]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSearchParams(buildParams({ search: debouncedSearch, type: filterType, field: sortBy, order: sortOrder }));
  }, [debouncedSearch, filterType, sortBy, sortOrder, buildParams, setSearchParams]);

  useEffect(() => {
    fetchStores();
  }, [searchParams.toString()]);

  const fetchStores = async () => {
    showLoading();
    setLoading(true);
    setFetchError(null);

    try {
      const params = new URLSearchParams(searchParams);
      const query = params.toString();
      const url = query ? `/store?${query}` : '/store';

      const response = await axiosInstance.get(url);
      setStores(response.data.data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      if (error.response?.status === 404) {
        setStores([]);
        setFetchError(null);
      } else {
        setFetchError(error.response?.data?.error?.explanation || 'Failed to load stores. Please try again.');
        setStores([]);
      }
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store? This will also delete all ratings.')) return;

    try {
      await axiosInstance.delete(`/store/${storeId}`);
      fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
    }
  };

  const handleSearchChange = (e) => setSearchInput(e.target.value);

  const handleFilterTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    setSearchParams(buildParams({ search: searchInput, type: newType, field: sortBy, order: sortOrder }));
  };

  const handleSort = (field) => {
    let newOrder = 'DESC';
    if (field === sortBy) {
      newOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    }
    setSortBy(field);
    setSortOrder(newOrder);
    setSearchParams(buildParams({ search: searchInput, type: filterType, field, order: newOrder }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setFilterType('name');
    setSortBy('createdAt');
    setSortOrder('DESC');
    setSearchParams({});
  };

  const renderStars = (rating, max = 5) => {
    const numericRating = parseFloat(rating) || 0;
    return Array.from({ length: max }).map((_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${index < Math.round(numericRating) ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const searchTerm = searchParams.get('name') || searchParams.get('address') || searchParams.get('email') || '';

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stores Management</h1>
          <p className="mt-1 text-sm text-gray-600">View and manage all stores in the system</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="mt-6">
        <div className="rounded-lg bg-white shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Search */}
              <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 ">
                <select
                  value={filterType}
                  onChange={handleFilterTypeChange}
                  className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="name">Name</option>
                  <option value="address">Address</option>
                  <option value="email">Email</option>
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

              {/* Sort */}
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
                  title={`Sort ${sortOrder === "ASC" ? "Ascending" : "Descending"}`}
                >
                  {sortOrder === "ASC" ? (
                    <ArrowUpIcon className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-gray-600" />
                  )}
                </button>

                {(searchTerm || sortBy !== "createdAt" || sortOrder !== "DESC") && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stores Table */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading stores...</p>
            </div>
          ) : fetchError ? (
            <div className="p-8 text-center">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Stores</h3>
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? `No stores found matching "${searchTerm}"` 
                  : 'No stores available at the moment'}
              </p>
              {searchTerm && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-sm text-primary-600 hover:text-primary-500"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Store
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Contact
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Address
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Owner
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Rating
                    </th>
                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <BuildingStorefrontIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{store.storeName}</div>
                            <div className="text-sm text-gray-500">
                              
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{store.owner.email}</td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate">{store.address}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{store.owner?.name || 'Unknown'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center">
                          <div className="flex">{renderStars(store.averageRating)}</div>
                          <span className="ml-2 font-medium text-gray-900">{parseFloat(store.averageRating || 0).toFixed(1)}</span>
                        </div>
                      </td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

         
        </div>
      </div>
    </div>
  );
}
