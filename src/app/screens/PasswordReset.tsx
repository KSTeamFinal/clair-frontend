/*
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import client from '../../api/client';

export function PasswordReset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [messageModal, setMessageModal] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  const isPasswordValid = password.length >= 8;
  const isPasswordMatched =
    password === passwordConfirm && passwordConfirm.length > 0;

  const canSubmit =
    token && isTokenValid && isPasswordValid && isPasswordMatched && !isLoading;

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsVerifying(false);
        return;
      }

      try {
        setIsVerifying(true);

        await client.get('/api/v1/auth/password-reset/verify', {
          params: { token },
        });

        setIsTokenValid(true);
      } catch (error) {
        console.error('비밀번호 재설정 토큰 검증 실패:', error);
        setIsTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleBack = () => {
    navigate('/login');
  };

  const handleSubmit = async () => {
    if (!token || !isTokenValid) {
      setMessageModal({
        type: 'error',
        title: '유효하지 않은 링크예요',
        description: '비밀번호 재설정 링크가 올바르지 않습니다.',
      });
      return;
    }

    if (!isPasswordValid) {
      setMessageModal({
        type: 'error',
        title: '비밀번호를 확인해주세요',
        description: '새 비밀번호는 8자 이상이어야 합니다.',
      });
      return;
    }

    if (!isPasswordMatched) {
      setMessageModal({
        type: 'error',
        title: '비밀번호가 일치하지 않아요',
        description: '새 비밀번호와 비밀번호 확인을 다시 확인해주세요.',
      });
      return;
    }

    try {
      setIsLoading(true);

      await client.post('/api/v1/auth/password-reset/confirm', {
        token,
        new_password: password,
      });

      setMessageModal({
        type: 'success',
        title: '비밀번호가 변경되었어요',
        description: '새 비밀번호로 다시 로그인해주세요.',
      });
    } catch (error: any) {
      setMessageModal({
        type: 'error',
        title: '비밀번호 재설정에 실패했어요',
        description:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalConfirm = () => {
    if (messageModal?.type === 'success') {
      navigate('/login');
      return;
    }

    setMessageModal(null);
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
            <div className="mx-auto max-w-[460px] text-center">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/90 bg-white/82 px-4 py-2 text-[12px] font-medium text-slate-500 shadow-sm backdrop-blur sm:mb-6 sm:px-5 sm:py-2.5 sm:text-[13px]">
                Password Reset
              </div>

              <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.05em] text-slate-900 sm:text-[40px] lg:text-[50px]">
                새 비밀번호 설정
              </h1>

              <p className="mt-3 text-[15px] leading-7 text-slate-500 sm:text-[16px] sm:leading-8 lg:text-[18px]">
                안전한 계정 이용을 위해 새 비밀번호를 입력해주세요.
              </p>
            </div>

            <div className="mx-auto mt-7 max-w-[520px] sm:mt-8">
              <div
                className="rounded-[28px] border border-white/90 bg-white/80 p-5 backdrop-blur sm:rounded-[32px] sm:p-7 lg:p-8"
                style={{
                  boxShadow: '0 30px 70px rgba(15,23,42,0.10)',
                }}
              >
                {isVerifying ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#DDE6FF] border-t-[#667AF2]" />
                    <h2 className="mt-5 text-[21px] font-bold tracking-[-0.04em] text-slate-900">
                      링크를 확인하고 있어요
                    </h2>
                    <p className="mt-2 text-[14px] leading-6 text-slate-500">
                      잠시만 기다려주세요.
                    </p>
                  </div>
                ) : !isTokenValid ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3FF] text-[24px] font-bold text-[#667AF2]">
                      !
                    </div>

                    <h2 className="mt-5 text-[22px] font-bold tracking-[-0.04em] text-slate-900">
                      유효하지 않은 링크예요
                    </h2>

                    <p className="mt-3 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                      비밀번호 재설정 링크가 만료되었거나 올바르지 않습니다.
                      <br />
                      다시 비밀번호 찾기를 진행해주세요.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="mt-7 h-[52px] w-full rounded-[18px] text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 sm:h-[56px] sm:text-[16px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                        boxShadow: '0 18px 38px rgba(102,122,242,0.24)',
                      }}
                    >
                      로그인으로 이동
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                        새 비밀번호
                      </label>
                      <input
                        type="password"
                        placeholder="8자 이상 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                      />

                      {password.length > 0 && !isPasswordValid && (
                        <p className="mt-2 text-left text-[13px] font-medium text-rose-400">
                          비밀번호는 8자 이상이어야 합니다.
                        </p>
                      )}
                    </div>

                    <div className="mt-5 sm:mt-6">
                      <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                        새 비밀번호 확인
                      </label>
                      <input
                        type="password"
                        placeholder="비밀번호를 한 번 더 입력하세요"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSubmit();
                          }
                        }}
                        className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                      />

                      {passwordConfirm.length > 0 && !isPasswordMatched && (
                        <p className="mt-2 text-left text-[13px] font-medium text-rose-400">
                          비밀번호가 일치하지 않습니다.
                        </p>
                      )}
                    </div>

                    <div className="mt-6 rounded-[18px] border border-[#DDE6FF] bg-[#F6F8FF] px-4 py-4 sm:mt-7">
                      <p className="text-[13px] leading-6 text-slate-500 sm:text-[14px]">
                        새 비밀번호는 8자 이상으로 입력해주세요.
                        <br />
                        입력한 두 비밀번호가 일치해야 변경할 수 있어요.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="mt-6 h-[54px] w-full rounded-[18px] text-[16px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7 sm:h-[58px] sm:rounded-[20px] sm:text-[17px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                        boxShadow: '0 18px 38px rgba(102,122,242,0.24)',
                      }}
                    >
                      {isLoading ? '변경 중...' : '새 비밀번호 설정'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {messageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[28px] border border-white/90 bg-white/95 px-6 py-7 text-center shadow-[0_24px_70px_rgba(95,117,177,0.24)]">
            <button
              type="button"
              onClick={handleModalConfirm}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mt-1 flex h-13 w-13 items-center justify-center rounded-full bg-[#EEF3FF] text-[24px] font-bold text-[#667AF2]">
              {messageModal.type === 'success' ? '✓' : '!'}
            </div>

            <h2 className="mt-5 text-[21px] font-bold tracking-[-0.03em] text-slate-900">
              {messageModal.title}
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-slate-500">
              {messageModal.description}
            </p>

            <button
              type="button"
              onClick={handleModalConfirm}
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
*/
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import client from '../../api/client';

export function PasswordReset() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // ✅ 자체 테스트용: token이 있으면 바로 유효하다고 처리
  const isTokenValid = Boolean(token);

  const [isLoading, setIsLoading] = useState(false);

  const [messageModal, setMessageModal] = useState<{
    type: 'success' | 'error';
    title: string;
    description: string;
  } | null>(null);

  const isPasswordValid = password.length >= 8;
  const isPasswordMatched =
    password === passwordConfirm && passwordConfirm.length > 0;

  const canSubmit =
    token && isTokenValid && isPasswordValid && isPasswordMatched && !isLoading;

  const handleBack = () => {
    navigate('/login');
  };

  const handleSubmit = async () => {
    if (!token || !isTokenValid) {
      setMessageModal({
        type: 'error',
        title: '유효하지 않은 링크예요',
        description: '비밀번호 재설정 링크가 올바르지 않습니다.',
      });
      return;
    }

    if (!isPasswordValid) {
      setMessageModal({
        type: 'error',
        title: '비밀번호를 확인해주세요',
        description: '새 비밀번호는 8자 이상이어야 합니다.',
      });
      return;
    }

    if (!isPasswordMatched) {
      setMessageModal({
        type: 'error',
        title: '비밀번호가 일치하지 않아요',
        description: '새 비밀번호와 비밀번호 확인을 다시 확인해주세요.',
      });
      return;
    }

    try {
      setIsLoading(true);

      await client.post('/api/v1/auth/password-reset/confirm', {
        token,
        new_password: password,
      });

      setMessageModal({
        type: 'success',
        title: '비밀번호가 변경되었어요',
        description: '새 비밀번호로 다시 로그인해주세요.',
      });
    } catch (error: any) {
      setMessageModal({
        type: 'error',
        title: '비밀번호 재설정에 실패했어요',
        description:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalConfirm = () => {
    if (messageModal?.type === 'success') {
      navigate('/login');
      return;
    }

    setMessageModal(null);
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
            <div className="mx-auto max-w-[460px] text-center">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/90 bg-white/82 px-4 py-2 text-[12px] font-medium text-slate-500 shadow-sm backdrop-blur sm:mb-6 sm:px-5 sm:py-2.5 sm:text-[13px]">
                Password Reset
              </div>

              <h1 className="text-[32px] font-semibold leading-[1.12] tracking-[-0.05em] text-slate-900 sm:text-[40px] lg:text-[50px]">
                새 비밀번호 설정
              </h1>

              <p className="mt-3 text-[15px] leading-7 text-slate-500 sm:text-[16px] sm:leading-8 lg:text-[18px]">
                안전한 계정 이용을 위해 새 비밀번호를 입력해주세요.
              </p>
            </div>

            <div className="mx-auto mt-7 max-w-[520px] sm:mt-8">
              <div
                className="rounded-[28px] border border-white/90 bg-white/80 p-5 backdrop-blur sm:rounded-[32px] sm:p-7 lg:p-8"
                style={{
                  boxShadow: '0 30px 70px rgba(15,23,42,0.10)',
                }}
              >
                {!isTokenValid ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF3FF] text-[24px] font-bold text-[#667AF2]">
                      !
                    </div>

                    <h2 className="mt-5 text-[22px] font-bold tracking-[-0.04em] text-slate-900">
                      유효하지 않은 링크예요
                    </h2>

                    <p className="mt-3 text-[14px] leading-6 text-slate-500 sm:text-[15px]">
                      비밀번호 재설정 토큰이 없습니다.
                      <br />
                      다시 비밀번호 찾기를 진행해주세요.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="mt-7 h-[52px] w-full rounded-[18px] text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 sm:h-[56px] sm:text-[16px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                        boxShadow: '0 18px 38px rgba(102,122,242,0.24)',
                      }}
                    >
                      로그인으로 이동
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                        새 비밀번호
                      </label>
                      <input
                        type="password"
                        placeholder="8자 이상 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                      />

                      {password.length > 0 && !isPasswordValid && (
                        <p className="mt-2 text-left text-[13px] font-medium text-rose-400">
                          비밀번호는 8자 이상이어야 합니다.
                        </p>
                      )}
                    </div>

                    <div className="mt-5 sm:mt-6">
                      <label className="mb-3 block text-left text-[14px] font-semibold text-slate-800 sm:text-[15px]">
                        새 비밀번호 확인
                      </label>
                      <input
                        type="password"
                        placeholder="비밀번호를 한 번 더 입력하세요"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSubmit();
                          }
                        }}
                        className="h-[52px] w-full rounded-[16px] border border-slate-200/80 bg-white/88 px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                      />

                      {passwordConfirm.length > 0 && !isPasswordMatched && (
                        <p className="mt-2 text-left text-[13px] font-medium text-rose-400">
                          비밀번호가 일치하지 않습니다.
                        </p>
                      )}
                    </div>

                    <div className="mt-6 rounded-[18px] border border-[#DDE6FF] bg-[#F6F8FF] px-4 py-4 sm:mt-7">
                      <p className="text-[13px] leading-6 text-slate-500 sm:text-[14px]">
                        새 비밀번호는 8자 이상으로 입력해주세요.
                        <br />
                        입력한 두 비밀번호가 일치해야 변경할 수 있어요.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                      className="mt-6 h-[54px] w-full rounded-[18px] text-[16px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7 sm:h-[58px] sm:rounded-[20px] sm:text-[17px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                        boxShadow: '0 18px 38px rgba(102,122,242,0.24)',
                      }}
                    >
                      {isLoading ? '변경 중...' : '새 비밀번호 설정'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {messageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-5 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-[28px] border border-white/90 bg-white/95 px-6 py-7 text-center shadow-[0_24px_70px_rgba(95,117,177,0.24)]">
            <button
              type="button"
              onClick={handleModalConfirm}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="닫기"
            >
              <X size={18} />
            </button>

            <div className="mx-auto mt-1 flex h-13 w-13 items-center justify-center rounded-full bg-[#EEF3FF] text-[24px] font-bold text-[#667AF2]">
              {messageModal.type === 'success' ? '✓' : '!'}
            </div>

            <h2 className="mt-5 text-[21px] font-bold tracking-[-0.03em] text-slate-900">
              {messageModal.title}
            </h2>

            <p className="mt-2 text-[14px] leading-6 text-slate-500">
              {messageModal.description}
            </p>

            <button
              type="button"
              onClick={handleModalConfirm}
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