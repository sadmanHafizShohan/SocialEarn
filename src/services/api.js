import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api', timeout: 30000 });
let tokenProvider = null;

export const setTokenProvider = (provider) => { tokenProvider = provider; };

api.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use((response) => {
  if (response.data && response.data.success === false) {
    return Promise.reject(new Error(response.data.message || 'Request failed'));
  }
  return response.data;
}, (error) => {
  const message = error.response?.data?.message || error.message || 'Request failed';
  return Promise.reject(new Error(message));
});

export const request = (method, url, data, config) => api({ method, url, data, ...config });
export default api;
