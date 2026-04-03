// Login.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleLogin = () => {
    navigate('/home');
  };

  const handleSignUp = () => {
    navigate('/signup');
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
                    className="text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-800 sm:text-[15px]"
                  >
                    비밀번호 찾기
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="mt-6 h-[54px] w-full rounded-[18px] text-[16px] font-semibold text-white transition-all hover:-translate-y-0.5 sm:mt-7 sm:h-[58px] sm:rounded-[20px] sm:text-[17px]"
                  style={{
                    background:
                      'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                    boxShadow: '0 18px 38px rgba(102,122,242,0.24)',
                  }}
                >
                  로그인
                </button>

                <div className="mt-6 flex items-center gap-4 sm:mt-7">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[14px] text-slate-400">또는</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="mt-5 space-y-3 sm:mt-6">
                  <button
                    type="button"
                    className="flex h-[52px] w-full items-center justify-center rounded-[16px] border border-slate-200/80 bg-white/94 px-4 text-[15px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-white sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  >
                    <span className="mr-3 text-[22px] font-semibold text-[#4285F4]">
                      G
                    </span>
                    Google로 계속하기
                  </button>

                  <button
                    type="button"
                    className="flex h-[52px] w-full items-center justify-center rounded-[16px] border border-slate-200/80 bg-white/94 px-4 text-[15px] font-medium text-slate-700 shadow-sm transition-colors hover:bg-white sm:h-[56px] sm:rounded-[18px] sm:text-[16px]"
                  >
                    <span className="mr-3 text-[22px] font-extrabold text-[#03C75A]">
                      N
                    </span>
                    Naver로 계속하기
                  </button>

                  <button
                    type="button"
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
    </div>
  );
}