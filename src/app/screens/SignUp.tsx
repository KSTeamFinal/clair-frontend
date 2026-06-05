// SignUp.tsx
import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Mail, ShieldCheck } from 'lucide-react';
import client from '../../api/client';

export function SignUp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [expireSeconds, setExpireSeconds] = useState(600);
  const [emailMessage, setEmailMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isConfirmingCode, setIsConfirmingCode] = useState(false);

  const [isSignUpSuccessOpen, setIsSignUpSuccessOpen] = useState(false);
  const [isSignUpErrorOpen, setIsSignUpErrorOpen] = useState(false);
  const [isTermsRequiredOpen, setIsTermsRequiredOpen] = useState(false);
  const [socialProviderName, setSocialProviderName] = useState('');

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!verificationRequested || emailVerified || expireSeconds <= 0) return;

    const timer = setInterval(() => {
      setExpireSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationRequested, emailVerified, expireSeconds]);

  const handleBack = () => {
    navigate('/login');
  };

  const handleSocialLogin = (provider: 'google' | 'naver' | 'kakao') => {
    const providerNames = {
      google: 'Google',
      naver: 'Naver',
      kakao: 'KakaoTalk',
    };

    setSocialProviderName(providerNames[provider]);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;

    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const getErrorMessage = (error: any, fallback: string) => {
    return (
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      fallback
    );
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setEmail(value);

    if (emailVerified || verificationRequested) {
      setEmailVerified(false);
      setVerificationRequested(false);
      setVerificationCode('');
      setExpireSeconds(600);
      setCooldown(0);
      setEmailMessage('');
      setEmailError('이메일이 변경되어 다시 인증이 필요합니다.');
    }
  };

  const handleRequestVerification = async () => {
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsRequestingCode(true);
      setEmailError('');
      setEmailMessage('');

      await client.post('/api/v1/auth/email-verification/request', {
        email: email.trim(),
      });

      setVerificationRequested(true);
      setEmailVerified(false);
      setVerificationCode('');
      setCooldown(60);
      setExpireSeconds(600);

      setEmailMessage('인증 코드가 이메일로 전송되었습니다. 메일함을 확인해주세요.');
    } catch (error: any) {
      setEmailError(getErrorMessage(error, '인증 코드 요청에 실패했습니다.'));
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleConfirmVerification = async () => {
    if (!verificationCode.trim()) {
      setEmailError('인증 코드를 입력해주세요.');
      return;
    }

    if (expireSeconds <= 0) {
      setEmailError('만료된 코드입니다. 인증 코드를 다시 요청해주세요.');
      return;
    }

    try {
      setIsConfirmingCode(true);
      setEmailError('');
      setEmailMessage('');

      await client.post('/api/v1/auth/email-verification/confirm', {
        email: email.trim(),
        code: verificationCode.trim(),
      });

      setEmailVerified(true);
      setEmailMessage('이메일 인증이 완료되었습니다.');
    } catch (error: any) {
      setEmailVerified(false);
      setEmailError(getErrorMessage(error, '인증 코드 확인에 실패했습니다.'));
    } finally {
      setIsConfirmingCode(false);
    }
  };

  const handleSignUp = async () => {
    if (!emailVerified) {
      setEmailError('이메일 인증이 필요합니다.');
      return;
    }

    if (!isTermsChecked) {
      setIsTermsRequiredOpen(true);
      return;
    }

    if (
      !email.trim() ||
      !nickname.trim() ||
      !password.trim() ||
      !passwordCheck.trim() ||
      password !== passwordCheck
    ) {
      setIsSignUpErrorOpen(true);
      return;
    }

    try {
      await client.post('/api/v1/auth/signup', {
        email: email.trim(),
        nickname: nickname.trim(),
        password,
        password_confirm: passwordCheck,
      });

      setIsSignUpSuccessOpen(true);
    } catch (error: any) {
      setEmailError(getErrorMessage(error, '회원가입에 실패했습니다.'));
      setIsSignUpErrorOpen(true);
    }
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
                Sign Up
              </div>

              <h1 className="text-[34px] font-semibold leading-[1.12] tracking-[-0.05em] text-slate-900 sm:text-[42px] lg:text-[54px]">
                회원가입
              </h1>

              <p className="mt-3 text-[15px] leading-7 text-slate-500 sm:text-[16px] sm:leading-8 lg:text-[18px]">
                새 계정을 만들고 계약 분석을 시작해보세요.
              </p>
            </div>

            <div className="mx-auto mt-7 max-w-[520px] sm:mt-8">
              <div
                className="rounded-[28px] border border-white/90 bg-white/80 p-5 backdrop-blur sm:rounded-[32px] sm:p-7 lg:p-8"
                style={{
                  boxShadow: '0 30px 70px rgba(15,23,42,0.10)',
                }}
              >
                <div className="rounded-[24px] border border-[#E6ECFF] bg-white/72 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-[0_12px_26px_rgba(102,122,242,0.22)]"
                        style={{
                          background:
                            'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                        }}
                      >
                        <Mail size={19} strokeWidth={2.3} />
                      </div>

                      <div className="text-left">
                        <p className="text-[13px] font-semibold text-[#667AF2]">
                          STEP 1
                        </p>
                        <h2 className="text-[16px] font-bold tracking-[-0.03em] text-slate-900 sm:text-[17px]">
                          이메일 인증
                        </h2>
                      </div>
                    </div>

                    {emailVerified && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF3FF] px-3 py-1.5 text-[12px] font-semibold text-[#667AF2]">
                        <ShieldCheck size={14} />
                        인증 완료
                      </div>
                    )}
                  </div>

                  <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                    이메일
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={handleEmailChange}
                      disabled={emailVerified}
                      className="h-[52px] min-w-0 flex-1 rounded-[16px] border border-slate-200/80 bg-white px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] disabled:cursor-not-allowed disabled:bg-[#F8FAFF] disabled:text-slate-500 sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                    />

                    <button
                      type="button"
                      onClick={handleRequestVerification}
                      disabled={cooldown > 0 || isRequestingCode || emailVerified}
                      className="h-[52px] w-[132px] flex-shrink-0 whitespace-nowrap rounded-[16px] px-4 text-[12px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:h-[56px] sm:w-[148px] sm:rounded-[18px] sm:px-5 sm:text-[13px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                        boxShadow: '0 12px 26px rgba(102,122,242,0.22)',
                      }}
                    >
                      {emailVerified
                        ? '인증 완료'
                        : isRequestingCode
                          ? '발송 중'
                          : cooldown > 0
                            ? `${cooldown}초 후`
                            : '인증 코드 받기'}
                    </button>
                  </div>

                  {verificationRequested && !emailVerified && (
                    <div className="mt-4 rounded-[20px] border border-slate-200/80 bg-[#F8FAFF] p-3 sm:p-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="6자리 인증 코드"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          className="h-[52px] min-w-0 flex-1 rounded-[16px] border border-slate-200/80 bg-white px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                        />

                        <button
                          type="button"
                          onClick={handleConfirmVerification}
                          disabled={isConfirmingCode || expireSeconds <= 0}
                          className="h-[52px] w-[128px] flex-shrink-0 whitespace-nowrap rounded-[16px] px-4 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:h-[56px] sm:w-[140px] sm:rounded-[18px] sm:px-5 sm:text-[14px]"
                            style={{
                            background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                            boxShadow: '0 12px 26px rgba(102,122,242,0.22)',
                          }}
                        >
                          {isConfirmingCode ? '확인 중' : '인증 확인'}
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-left text-[13px] text-slate-500">
                          인증 코드 유효시간{' '}
                          <span className="font-semibold text-slate-700">
                            {formatTime(expireSeconds)}
                          </span>
                        </p>

                        <span className="whitespace-nowrap text-[13px] font-medium text-slate-400">
                          5회 실패 시 재발급 필요
                        </span>
                      </div>
                    </div>
                  )}

                  {emailMessage && (
                    <p className="mt-3 rounded-[16px] bg-[#EEF3FF] px-4 py-3 text-left text-[13px] font-medium leading-5 text-[#667AF2]">
                      {emailMessage}
                    </p>
                  )}

                  {emailError && (
                    <p className="mt-3 rounded-[16px] bg-red-50 px-4 py-3 text-left text-[13px] font-medium leading-5 text-red-500">
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center gap-3 sm:mt-6">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-[12px] font-medium text-slate-400">
                    STEP 2
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="mt-5 sm:mt-6">
                  <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                    닉네임
                  </label>
                  <input
                    type="text"
                    placeholder="사용할 닉네임을 입력하세요"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={!emailVerified}
                    className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  />
                </div>

                <div className="mt-5 sm:mt-6">
                  <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    placeholder="8자 이상 입력하세요"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!emailVerified}
                    className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  />
                </div>

                <div className="mt-5 sm:mt-6">
                  <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    placeholder="비밀번호를 다시 입력하세요"
                    value={passwordCheck}
                    onChange={(e) => setPasswordCheck(e.target.value)}
                    disabled={!emailVerified}
                    className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  />
                </div>

                <div className="mt-5 space-y-3 sm:mt-6">
                  <label className="inline-flex items-start gap-3 text-[14px] leading-6 text-slate-600 sm:text-[15px]">
                    <input
                      type="checkbox"
                      checked={isTermsChecked}
                      onChange={(e) => setIsTermsChecked(e.target.checked)}
                      disabled={!emailVerified}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#6C80DD] disabled:cursor-not-allowed"
                    />
                    <span>서비스 이용약관 및 개인정보 처리방침에 동의합니다</span>
                  </label>

                  <label className="inline-flex items-start gap-3 text-[14px] leading-6 text-slate-600 sm:text-[15px]">
                    <input
                      type="checkbox"
                      checked={isMarketingChecked}
                      onChange={(e) => setIsMarketingChecked(e.target.checked)}
                      disabled={!emailVerified}
                      className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#6C80DD] disabled:cursor-not-allowed"
                    />
                    <span>마케팅 정보 수신에 동의합니다 (선택)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={!emailVerified}
                  className="mt-6 h-[54px] w-full rounded-[18px] text-[16px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:mt-7 sm:h-[58px] sm:rounded-[20px] sm:text-[17px]"
                  style={{
                    background:
                      'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                    boxShadow: '0 18px 38px rgba(102,122,242,0.24)',
                  }}
                >
                  회원가입
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
                    이미 계정이 있으신가요?
                  </span>
                  <button
                    type="button"
                    onClick={handleLogin}
                    className="ml-2 text-[14px] font-semibold text-[#6C80DD] transition-opacity hover:opacity-80 sm:text-[15px]"
                  >
                    로그인
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      {isSignUpSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[28px] border border-white/90 bg-white/95 px-6 py-7 text-center shadow-[0_24px_70px_rgba(95,117,177,0.24)]">
            <button
              type="button"
              onClick={() => setIsSignUpSuccessOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mt-1 flex h-13 w-13 items-center justify-center rounded-full bg-[#EEF3FF] text-[22px] font-bold text-[#667AF2]">
              ✓
            </div>

            <h2 className="mt-5 text-[21px] font-bold tracking-[-0.03em] text-slate-900">
              회원가입이 완료되었어요
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-slate-500">
              이제 로그인해서 CLAIR를 시작해보세요.
            </p>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-6 h-12 w-full rounded-[16px] text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                background:
                  'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                boxShadow: '0 14px 30px rgba(102,122,242,0.24)',
              }}
            >
              로그인 하러가기
            </button>
          </div>
        </div>
      )}

      {isSignUpErrorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[28px] border border-white/90 bg-white/95 px-6 py-7 text-center shadow-[0_24px_70px_rgba(95,117,177,0.24)]">
            <button
              type="button"
              onClick={() => setIsSignUpErrorOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mt-1 flex h-13 w-13 items-center justify-center rounded-full bg-[#EEF3FF] text-[24px] font-bold text-[#667AF2]">
              !
            </div>

            <h2 className="mt-5 text-[21px] font-bold tracking-[-0.03em] text-slate-900">
              회원가입에 실패했어요
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-slate-500">
              입력 정보를 다시 확인하거나 이미 사용 중인 이메일인지 확인해주세요.
            </p>

            <button
              type="button"
              onClick={() => setIsSignUpErrorOpen(false)}
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

      {isTermsRequiredOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[28px] border border-white/90 bg-white/95 px-6 py-7 text-center shadow-[0_24px_70px_rgba(95,117,177,0.24)]">
            <button
              type="button"
              onClick={() => setIsTermsRequiredOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mt-1 flex h-13 w-13 items-center justify-center rounded-full bg-[#EEF3FF] text-[24px] font-bold text-[#667AF2]">
              !
            </div>

            <h2 className="mt-5 text-[21px] font-bold tracking-[-0.03em] text-slate-900">
              약관 동의가 필요해요
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-slate-500">
              서비스 이용약관 및 개인정보 처리방침에 동의해주세요.
            </p>

            <button
              type="button"
              onClick={() => setIsTermsRequiredOpen(false)}
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

      {socialProviderName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[380px] rounded-[28px] border border-white/90 bg-white/95 px-6 py-7 text-center shadow-[0_24px_70px_rgba(95,117,177,0.24)]">
            <button
              type="button"
              onClick={() => setSocialProviderName('')}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mt-1 flex h-13 w-13 items-center justify-center rounded-full bg-[#EEF3FF] text-[24px] font-bold text-[#667AF2]">
              !
            </div>

            <h2 className="mt-5 text-[21px] font-bold tracking-[-0.03em] text-slate-900">
              소셜 가입을 준비 중이에요
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-slate-500">
              {socialProviderName} 계정 연동 설정이 아직 완료되지 않았어요.
              <br />
              지금은 이메일 회원가입을 이용해주세요.
            </p>

            <button
              type="button"
              onClick={() => setSocialProviderName('')}
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
    </div>
  );
}
