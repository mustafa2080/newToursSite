import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Backup API
export const backupAPI = {
  getAll: () => api.get('/backup'),
  getStats: () => api.get('/backup/stats'),
  create: (data) => api.post('/backup/create', data),
  download: (id) => api.get(`/backup/download/${id}`, { responseType: 'blob' }),
  restore: (id) => api.post(`/backup/restore/${id}`),
  delete: (id) => api.delete(`/backup/${id}`),
  uploadAndRestore: (formData) => api.post('/backup/upload-restore', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Logs API
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
  getById: (id) => api.get(`/logs/${id}`),
  clear: () => api.delete('/logs'),
  export: (filters) => api.get('/logs/export', {
    params: filters,
    responseType: 'blob'
  }),
  getStats: () => api.get('/logs/stats')
};

// Comments API
export const commentsAPI = {
  getByItem: (itemType, itemId) => api.get(`/comments/${itemType}/${itemId}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`),
  getAll: (params) => api.get('/comments', { params })
};

export default api;
