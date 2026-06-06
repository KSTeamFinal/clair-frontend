// Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
// 점 두 개(..)가 두 번 필요합니다!
import client from '../../api/client';
import { redirectToSocialLogin, type SocialProvider } from '../../api/socialAuth';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoginErrorOpen, setIsLoginErrorOpen] = useState(false);
  const [isFindPasswordOpen, setIsFindPasswordOpen] = useState(false);
  const [findPasswordEmail, setFindPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const handleBack = () => {
    navigate('/');
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    redirectToSocialLogin(provider);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setIsLoginErrorOpen(true);
      return;
    }

    try {
      setIsLoading(true);

      const { data } = await client.post('/api/v1/auth/login/json', { email, password });
      const token = data.accessToken || data.access_token;

      if (token) {
        localStorage.setItem('accessToken', token);
        if (data.user) {
          localStorage.setItem('userInfo', JSON.stringify(data.user));
        }
        navigate('/home');
      } else {
        setIsLoginErrorOpen(true);
      }
    } catch (error) {
      console.error(error);
      setIsLoginErrorOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleFindPasswordSubmit = async () => {
    if (!findPasswordEmail.trim()) return;

    try {
      setIsSendingReset(true);
      setResetError('');
      setResetMessage('');

      await client.post('/api/v1/auth/password-reset/request', {
        email: findPasswordEmail.trim(),
      });

      setResetMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다. 메일함을 확인해주세요.');
      setFindPasswordEmail('');
    } catch (error: any) {
      setResetError(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        '이메일 전송에 실패했습니다. 가입된 이메일인지 확인해주세요.'
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleCloseFindPassword = () => {
    setIsFindPasswordOpen(false);
    setFindPasswordEmail('');
    setResetMessage('');
    setResetError('');
  };

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.18) 0%, rgba(95,117,177,0.06) 24%, transparent 48%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24">
        <header className="flex h-18 items-center py-4 sm:h-20 sm:py-0">
          <div className="flex w-[72px] items-center justify-start sm:w-[96px]">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-800 sm:text-[15px]"
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
              뒤로
            </button>
          </div>

          <div className="flex-1 text-center">
            <span className="pointer-events-none text-[18px] font-medium tracking-[0.18em] text-slate-700 sm:text-[22px] lg:text-[24px]">
              CLAIR.
            </span>
          </div>

          <div className="w-[72px] sm:w-[96px]" aria-hidden="true" />
        </header>

        <main className="flex flex-1 items-center justify-center pt-8 pb-16 sm:pt-10 sm:pb-20 lg:pt-6 lg:pb-24">
          <section className="w-full max-w-[980px]">
            <div className="mx-auto max-w-[420px] text-center">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/90 bg-white/82 px-4 py-2 text-[12px] font-medium text-slate-500 shadow-sm backdrop-blur sm:mb-6 sm:px-5 sm:py-2.5 sm:text-[13px]">
                Login
              </div>

              <h1 className="text-[34px] font-semibold leading-[1.12] tracking-[-0.05em] text-slate-900 sm:text-[42px] lg:text-[54px]">
                로그인
              </h1>

              <p className="mt-3 text-[15px] leading-7 text-slate-500 sm:text-[16px] sm:leading-8 lg:text-[18px]">
                계정에 접속하고 계약 분석을 이어가세요.
              </p>
            </div>

            <div className="mx-auto mt-7 max-w-[520px] sm:mt-8">
              <div
                className="rounded-[28px] border border-white/90 bg-white/80 p-5 backdrop-blur sm:rounded-[32px] sm:p-7 lg:p-8"
                style={{
                  boxShadow: '0 30px 70px rgba(15,23,42,0.10)',
                }}
              >
                <div>
                  <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                    이메일
                  </label>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  />
                </div>

                <div className="mt-5 sm:mt-6">
                  <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleLogin();
                      }
                    }}
                    className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 sm:mt-5">
                  <label className="inline-flex items-center gap-2 text-[14px] text-slate-600 sm:text-[15px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 accent-[#6C80DD]"
                    />
                    로그인 유지
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsFindPasswordOpen(true)}
                    className="text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-800 sm:text-[15px]"
                  >
                    비밀번호 찾기
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="mt-6 h-[54px] w-full rounded-[18px] text-[16px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-7 sm:h-[58px] sm:rounded-[20px] sm:text-[17px]"
                  style={{
                    background:
                      'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                    boxShadow: '0 18px 38px rgba(102,122,242,0.24)',
                  }}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </button>

                <div className="mt-6 flex items-center gap-4 sm:mt-7">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[14px] text-slate-400">또는</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="mt-5 space-y-3 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="flex h-[52px] w-full items-center justify-center rounded-[16px] border border-slate-200/80 bg-white/94 px-4 text-[15px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-white sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  >
                    <span className="mr-3 text-[22px] font-semibold text-[#4285F4]">
                      G
                    </span>
                    Google로 계속하기
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('naver')}
                    className="flex h-[52px] w-full items-center justify-center rounded-[16px] border border-slate-200/80 bg-white/94 px-4 text-[15px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-white sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  >
                    <span className="mr-3 text-[22px] font-extrabold text-[#03C75A]">
                      N
                    </span>
                    Naver로 계속하기
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin('kakao')}
                    className="flex h-[52px] w-full items-center justify-center rounded-[16px] border border-[#F2D500] bg-[#FEE500] px-4 text-[15px] font-semibold text-[#191919] shadow-sm transition-colors hover:brightness-95 sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  >
                    <span className="mr-3 text-[18px] font-black">K</span>
                    KakaoTalk으로 계속하기
                  </button>
                </div>

                <div className="mt-6 text-center sm:mt-7">
                  <span className="text-[14px] text-slate-500 sm:text-[15px]">
                    계정이 없으신가요?
                  </span>
                  <button
                    type="button"
                    onClick={handleSignUp}
                    className="ml-2 text-[14px] font-semibold text-[#6C80DD] transition-opacity hover:opacity-80 sm:text-[15px]"
                  >
                    회원가입
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {isLoginErrorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[28px] border border-white/90 bg-white/95 px-6 py-7 text-center shadow-[0_24px_70px_rgba(95,117,177,0.24)]">
            <button
              type="button"
              onClick={() => setIsLoginErrorOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mt-1 flex h-13 w-13 items-center justify-center rounded-full bg-[#EEF3FF] text-[24px] font-bold text-[#667AF2]">
              !
            </div>

            <h2 className="mt-5 text-[21px] font-bold tracking-[-0.03em] text-slate-900">
              로그인에 실패했어요
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-slate-500">
              이메일 또는 비밀번호를 다시 확인해주세요.
            </p>

            <button
              type="button"
              onClick={() => setIsLoginErrorOpen(false)}
              className="mt-6 h-12 w-full rounded-[16px] text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                boxShadow: '0 14px 30px rgba(102,122,242,0.24)',
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {isFindPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[390px] rounded-[28px] border border-white/90 bg-white/95 px-6 py-7 shadow-[0_24px_70px_rgba(95,117,177,0.24)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[22px] font-bold tracking-[-0.04em] text-slate-900">
                  비밀번호 찾기
                </h2>
                <p className="mt-2 text-[14px] leading-6 text-slate-500">
                  가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드릴게요.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseFindPassword}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6">
              <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800">
                이메일
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={findPasswordEmail}
                onChange={(e) => setFindPasswordEmail(e.target.value)}
                disabled={isSendingReset || !!resetMessage}
                className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-[#EEF3FF] px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {resetMessage && (
              <p className="mt-3 rounded-[14px] bg-[#EEF3FF] px-4 py-3 text-left text-[13px] font-medium leading-5 text-[#667AF2]">
                {resetMessage}
              </p>
            )}

            {resetError && (
              <p className="mt-3 rounded-[14px] bg-red-50 px-4 py-3 text-left text-[13px] font-medium leading-5 text-red-500">
                {resetError}
              </p>
            )}

            {!resetMessage && (
              <button
                type="button"
                onClick={handleFindPasswordSubmit}
                disabled={isSendingReset || !findPasswordEmail.trim()}
                className="mt-6 h-12 w-full rounded-[16px] text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                  boxShadow: '0 14px 30px rgba(102,122,242,0.24)',
                }}
              >
                {isSendingReset ? '전송 중...' : '재설정 링크 보내기'}
              </button>
            )}

            <button
              type="button"
              onClick={handleCloseFindPassword}
              className="mt-3 h-11 w-full rounded-[16px] text-[14px] font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
            >
              {resetMessage ? '닫기' : '취소'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
