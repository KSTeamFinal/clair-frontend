import axios, { AxiosInstance } from 'axios';

/**
 * 1. BASE_URL 설정
 * 로컬 개발 환경인 경우 http://localhost:8000을 기본으로 사용하며,
 * 배포나 외부 접속 환경(ngrok 등)인 경우 환경 변수(VITE_API_URL)를 우선적으로 참조합니다.
 */
const BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8000'; 

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 2. 요청 인터셉터 (선택 사항)
 * 매번 모든 컴포넌트에서 headers에 토큰을 넣기 귀찮다면 아래 주석을 해제하세요.
 * 그러면 모든 client 요청에 자동으로 토큰이 포함됩니다.
 */

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


/**
 * 3. 응답 인터셉터 (토큰 만료 처리)
 * 서버로부터의 응답을 가로채서 401(인증 에러)이 발생하면 로그인 화면으로 튕겨냅니다.
 */
client.interceptors.response.use(
  (response) => {
    // 응답 성공 시 그대로 반환
    return response;
  },
  (error) => {
    // 서버 응답이 있고, 상태 코드가 401(Unauthorized)인 경우
    if (error.response && error.response.status === 401) {
      console.warn("인증이 만료되어 로그인 페이지로 이동합니다.");
      
      // 저장된 토큰 삭제 (유효하지 않으므로)
      localStorage.removeItem('accessToken');
      
      // 로그인 페이지로 강제 리다이렉트
      // 컴포넌트 외부이므로 window.location.href를 사용합니다.
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default client;