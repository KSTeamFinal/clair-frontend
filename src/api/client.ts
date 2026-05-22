import axios, { AxiosInstance } from 'axios';

const BASE_URL = (import.meta as any).env.VITE_API_URL || '';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  const hasAuthorization =
    Boolean(config.headers?.Authorization) ||
    Boolean(config.headers?.authorization);

  // 이미 Authorization 헤더가 있으면 덮어쓰지 않음
  if (token && !hasAuthorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';
    const method = error.config?.method?.toLowerCase();

    const isContractPollingRequest =
      requestUrl.includes('/api/v1/contracts/') && method === 'get';

    const isShareRequest =
      requestUrl.includes('/shares/') ||
      requestUrl.includes('/share') ||
      (requestUrl.includes('/api/v1/contracts/') && requestUrl.includes('/share'));

    if (status === 401) {
      console.warn('401 인증 오류 발생:', requestUrl);

      if (isContractPollingRequest || isShareRequest) {
        return Promise.reject(error);
      }

      localStorage.removeItem('accessToken');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

export default client;