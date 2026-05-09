import axios from 'axios';

const instance = axios.create({
  // 환경 변수에서 주소를 가져오고, 없으면 기본 주소를 사용하게 설정
  baseURL: process.env.VITE_API_URL || 'http://localhost:8000', 
  timeout: 5000,
});

// 요청 인터셉터 등 나머지 코드는 그대로...
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;