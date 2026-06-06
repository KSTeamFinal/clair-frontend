export type SocialProvider = 'google' | 'naver' | 'kakao';

const API_URL =
  (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8000';

export const redirectToSocialLogin = (provider: SocialProvider) => {
  const baseUrl = API_URL.replace(/\/$/, '');

  window.location.href = `${baseUrl}/api/v1/auth/${provider}`;
};
