import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  updatePassword: (data) => api.patch('/auth/update-password', data),
  getProfile: () => api.get('/auth/profile'),
};


export const storeAPI = {
  getAllStores: (params) => api.get('/store', { params }),
  getStore: (id) => api.get(`/store/${id}`),
  searchStores: (params) => api.get('/store', { params }),
  getStoresWithFilters: (filters) => {
    const params = new URLSearchParams();

    if (filters.name) params.append('name', filters.name);
    if (filters.address) params.append('address', filters.address);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    return api.get(`/store?${params.toString()}`);
  },
};

export const ratingAPI = {
  addRating: (storeId, data) => api.post(`/rating/${storeId}`, data),
  getStoreRatings: (storeId) => api.get(`/rating/${storeId}`),
  getAverageRating: (storeId) => api.get(`/rating/${storeId}/avg`),
  getTotalRatings: (storeId) => api.get(`/rating/${storeId}/total`),
  getUserRatingForStore: (storeId) => api.get(`/rating/${storeId}/user`),
  getTotalRatingsCount: () => api.get('/rating/count'),
  // getUserRatings: () => api.get('/rating'),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/create-user', data),
  getStats: () => api.get('/admin/stats'),
};

export default api;