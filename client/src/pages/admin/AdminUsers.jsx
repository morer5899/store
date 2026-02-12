import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  UserPlusIcon,
  UserCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useSearchParams } from 'react-router-dom';
import CreateUserModal from '../../components/CreateUserModal';

// Custom debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function AdminUsers() {
  const { axiosInstance } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Filter type (name/email)
  const initialFilterType = searchParams.has("name") ? "name" : searchParams.has("email") ? "email" : "name";
  const [filterType, setFilterType] = useState(initialFilterType);

  const initialSearchInput = searchParams.get(filterType) || "";
  const [searchInput, setSearchInput] = useState(initialSearchInput);

  const filterRole = searchParams.get("role") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("order") || "DESC";

  const debouncedSearch = useDebounce(searchInput, 500);

  // Build URL search params
  const buildParams = useCallback(({ 
    search = searchInput, 
    type = filterType, 
    role = filterRole,
    field = sortBy, 
    order = sortOrder 
  }) => {
    const params = new URLSearchParams();

    if (search) params.set(type, search);
    if (role) params.set("role", role);
    if (field) params.set("sortBy", field);
    if (order) params.set("order", order);

    return params;
  }, [searchInput, filterType, filterRole, sortBy, sortOrder]);

  // Update URL when debounced search changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setSearchParams(buildParams({ search: debouncedSearch, type: filterType }));
  }, [debouncedSearch, filterType, buildParams, setSearchParams]);

  // Update input field when filterType changes
  useEffect(() => {
    const value = searchParams.get(filterType) || "";
    setSearchInput(value);
  }, [filterType, searchParams]);

  const searchTerm = searchParams.get("name") || searchParams.get("email") || "";

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterRole, sortBy, sortOrder]);

  const fetchUsers = async () => {
    showLoading();
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams(searchParams);
      const query = params.toString();
      const url = query ? `/admin/users?${query}` : "/admin/users";
      const response = await axiosInstance.get(url);
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 404) {
        setUsers([]);
        setFetchError(null);
      } else {
        setFetchError(error.response?.data?.error?.explanation || 'Failed to load users. Please try again.');
        setUsers([]);
      }
    } finally {
      hideLoading();
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await axiosInstance.post('/admin/create-user', userData);
      fetchUsers();
      setShowCreateModal(false);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error?.explanation || 'Failed to create user' 
      };
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      alert('Delete user endpoint needs to be implemented in backend');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSearchChange = (e) => setSearchInput(e.target.value);

  const handleFilterTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);

    const value = searchParams.get(newType) || "";
    setSearchInput(value);

    setSearchParams(buildParams({ type: newType, search: value }));
  };

  const handleRoleFilterChange = (e) => setSearchParams(buildParams({ role: e.target.value }));

  const handleSort = (field) => {
    const newOrder = sortBy === field ? (sortOrder === "ASC" ? "DESC" : "ASC") : "ASC";
    setSearchParams(buildParams({ field, order: newOrder }));
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilterType("name");
    setSearchParams({});
  };

  const roleColors = {
    ADMIN: 'bg-purple-100 text-purple-800',
    STORE_OWNER: 'bg-blue-100 text-blue-800',
    USER: 'bg-green-100 text-green-800',
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="mt-1 text-sm text-gray-600">Manage all users in the system</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-6">
          <div className="rounded-lg bg-white shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Search */}
              <div className="flex flex-1 items-center gap-2 min-w-0">
                <select
                  value={filterType}
                  onChange={handleFilterTypeChange}
                  className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 flex-shrink-0"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                </select>

                <div className="relative flex-1 min-w-0">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm truncate py-2"
                    placeholder={`Search by ${filterType}...`}
                  />
                </div>
              </div>

              {/* Role Filter & Sort */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center">
                  <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <select
                    value={filterRole}
                    onChange={handleRoleFilterChange}
                    className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">All Roles</option>
                    <option value="USER">User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSort(e.target.value)}
                    className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="createdAt">Date</option>
                    <option value="name">Name</option>
                    <option value="email">Email</option>
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
                </div>

                {(searchTerm || filterRole || sortBy !== "createdAt" || sortOrder !== "DESC") && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-sm text-gray-500">Loading users...</p>
              </div>
            ) : fetchError ? (
              <div className="p-8 text-center">
                <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Users</h3>
                <p className="mt-1 text-sm text-gray-500">{fetchError}</p>
                <button
                  onClick={fetchUsers}
                  className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Try Again
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filterRole 
                    ? `No users found matching your criteria` 
                    : 'No users in the system yet'}
                </p>
                {(searchTerm || filterRole) && (
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 text-sm text-primary-600 hover:text-primary-500"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">User</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Address</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Joined</th>
                      <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 sm:pl-6">
                          <div className="flex items-center gap-2">
                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">{user.name?.charAt(0) || 'U'}</span>
                            </div>
                            <div className="truncate">
                              <div className="font-medium text-gray-900 truncate">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 truncate">{user.email}</td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">{user.address}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex gap-2 justify-end">
                          
                       
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

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />
    </>
  );
}
