import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('nexastore_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nexastore_token');
      localStorage.removeItem('nexastore_user');
      if (!window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API helpers
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  toggleWishlist: (productId) => api.post(`/auth/wishlist/${productId}`),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getRelated: (id) => api.get(`/products/${id}/related`),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  createReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getAll: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getSales: (params) => api.get('/analytics/sales', { params }),
  getBestSellers: () => api.get('/analytics/best-sellers'),
  getUserGrowth: (params) => api.get('/analytics/user-growth', { params }),
  getOrderStatus: () => api.get('/analytics/order-status'),
  getCategoryRevenue: () => api.get('/analytics/category-revenue'),
};

export const couponAPI = {
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
  validate: (data) => api.post('/coupons/validate', data),
};

export const uploadAPI = {
  uploadImages: (formData) =>
    api.post('/upload/product', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (publicId) => api.delete(`/upload/${encodeURIComponent(publicId)}`),
};
