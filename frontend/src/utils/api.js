import axios from 'axios';
import { getCachedData, setCachedData } from './apiCache';
// Analytics will be imported when available
// import { analytics } from './analytics';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MAX_RETRY_DELAY = 5000;

const hashKey = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(36);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000,
  maxRetries: 3,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.method === 'get' && !config.skipCache) {
      try {
        const cacheKey = hashKey(`${config.url}_${JSON.stringify(config.params || {})}`);
        const cached = getCachedData(cacheKey);
        if (cached) {
          config.adapter = () => Promise.resolve({
            data: cached,
            status: 200,
            statusText: 'OK (cached)',
            headers: {},
            config
          });
        }
      } catch (error) {
        console.warn('Cache check failed:', error);
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // analytics.track('api_success', { url: response.config.url });
    
    if (response.config.method === 'get' && !response.config.skipCache) {
      try {
        const cacheKey = hashKey(`${response.config.url}_${JSON.stringify(response.config.params || {})}`);
        setCachedData(cacheKey, response.data);
      } catch (error) {
        console.warn('Cache set failed:', error);
      }
    }
    return response;
  },
  async (error) => {
    // analytics.trackError(error, { url: error.config?.url });
    
    const config = error.config;
    
    if (!config) return Promise.reject(error);
    
    config.maxRetries = config.maxRetries || 3;
    config.retryCount = config.retryCount || 0;
    
    const shouldRetry = config.retryCount < config.maxRetries && 
                       (!error.response || error.response.status >= 500);
    
    if (shouldRetry) {
      config.retryCount += 1;
      const delay = Math.min(Math.pow(2, config.retryCount) * 1000, MAX_RETRY_DELAY);
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
