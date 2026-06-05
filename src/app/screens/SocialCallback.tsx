import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function SocialCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refresh_token');

    if (token) {
      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      navigate('/home', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-[15px] text-slate-500">로그인 처리 중...</p>
    </div>
  );
}
