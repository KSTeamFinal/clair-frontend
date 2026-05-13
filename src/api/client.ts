import axios, { AxiosInstance } from 'axios';

const BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8000';

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? '';

    const isContractPollingRequest =
      requestUrl.includes('/api/v1/contracts/') &&
      error.config?.method?.toLowerCase() === 'get';

    if (status === 401) {
      console.warn('401 인증 오류 발생:', requestUrl);

      // 계약서 분석 polling 중에는 자동 로그인 이동 금지
      if (isContractPollingRequest) {
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