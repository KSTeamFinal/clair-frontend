import { useNavigate } from 'react-router-dom';

export function StartScreen() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.15) 0%, rgba(95,117,177,0.06) 22%, transparent 46%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24">
        {/* Header */}
        <header className="flex h-18 items-center justify-between py-4 sm:h-20 sm:py-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[18px] font-medium tracking-[0.18em] text-slate-700 transition-opacity hover:opacity-80 sm:text-[22px] lg:text-[24px]"
          >
            CLAIR.
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-800 sm:text-[15px]"
          >
            로그인
          </button>
        </header>

        {/* Main */}
        <main className="flex flex-1 items-center py-4 sm:py-8 lg:py-0">
          <section className="grid w-full items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-[minmax(0,0.98fr)_minmax(620px,1.02fr)] lg:gap-16 xl:gap-24">
            {/* Left */}
            <div className="mx-auto w-full max-w-[610px] lg:mx-0">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/90 bg-white/82 px-4 py-2 text-[12px] font-medium text-slate-500 shadow-sm backdrop-blur sm:mb-6 sm:px-5 sm:py-2.5 sm:text-[13px]">
                Smart Contract Review
              </div>

              <h1 className="text-[36px] font-semibold leading-[1.06] tracking-[-0.05em] text-slate-950 sm:text-[46px] md:text-[54px] lg:text-[64px] xl:text-[80px]">
                계약을 더
                <br />
                안전하고 명확하게
              </h1>

              <p className="mt-4 max-w-[530px] text-[15px] leading-7 text-slate-500 sm:mt-5 sm:text-[16px] sm:leading-8 md:text-[17px] lg:mt-8 lg:text-[19px] lg:leading-9">
                복잡한 계약서를 빠르게 분석하고, 놓치기 쉬운 위험 조항을
                한눈에 확인할 수 있도록 도와줍니다.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4 lg:mt-12">
                <button
                  type="button"
                  onClick={() => navigate('/onboarding')}
                  className="inline-flex h-[50px] w-full items-center justify-center rounded-[16px] px-6 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 sm:h-[56px] sm:w-auto sm:min-w-[170px] sm:text-[16px] lg:h-[68px] lg:min-w-[210px] lg:rounded-[24px] lg:px-10 lg:text-[18px]"
                  style={{
                    background:
                      'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                    boxShadow: '0 18px 38px rgba(102,122,242,0.26)',
                  }}
                >
                  시작하기
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex h-[46px] w-full items-center justify-center rounded-[14px] bg-transparent px-6 text-[15px] font-medium text-slate-600 transition-colors hover:text-slate-900 sm:h-[56px] sm:w-auto sm:min-w-[120px] sm:text-[16px] lg:h-[68px] lg:min-w-[148px] lg:rounded-[24px] lg:px-8 lg:text-[18px]"
                >
                  로그인
                </button>
              </div>

              {/* Mobile / Tablet feature cards */}
              <div className="mt-7 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3 lg:mt-14 lg:gap-4">
                <div className="rounded-[18px] border border-slate-200/70 bg-white/88 p-3 shadow-sm backdrop-blur sm:rounded-[20px] sm:p-4 lg:rounded-[24px] lg:p-6">
                  <p className="text-[20px] font-semibold leading-none text-slate-900 sm:text-[24px] lg:text-[34px]">
                    Fast
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500 sm:mt-3 sm:text-[12px] lg:mt-4 lg:text-[14px] lg:leading-6">
                    빠른 계약 분석
                  </p>
                </div>

                <div className="rounded-[18px] border border-slate-200/70 bg-white/88 p-3 shadow-sm backdrop-blur sm:rounded-[20px] sm:p-4 lg:rounded-[24px] lg:p-6">
                  <p className="text-[20px] font-semibold leading-none text-slate-900 sm:text-[24px] lg:text-[34px]">
                    Clear
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500 sm:mt-3 sm:text-[12px] lg:mt-4 lg:text-[14px] lg:leading-6">
                    명확한 리스크 표시
                  </p>
                </div>

                <div className="rounded-[18px] border border-slate-200/70 bg-white/88 p-3 shadow-sm backdrop-blur sm:rounded-[20px] sm:p-4 lg:rounded-[24px] lg:p-6">
                  <p className="text-[20px] font-semibold leading-none text-slate-900 sm:text-[24px] lg:text-[34px]">
                    Safe
                  </p>
                  <p className="mt-2 text-[11px] leading-5 text-slate-500 sm:mt-3 sm:text-[12px] lg:mt-4 lg:text-[14px] lg:leading-6">
                    안전한 계약 판단
                  </p>
                </div>
              </div>

              {/* Mobile / Tablet preview */}
              <div className="mt-6 block lg:hidden">
                <div className="rounded-[24px] border border-white/90 bg-white/82 p-3 shadow-[0_22px_54px_rgba(15,23,42,0.10)] backdrop-blur sm:rounded-[28px] sm:p-4">
                  <div className="mb-3 flex items-center justify-between rounded-[14px] bg-slate-50/95 px-3 py-3 sm:mb-4 sm:rounded-[16px] sm:px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#6C80DD]" />
                      <span className="text-[12px] font-medium text-slate-600 sm:text-[13px]">
                        Contract_Analysis.pdf
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[18px] bg-slate-50/90 p-4">
                      <div className="space-y-2.5">
                        <div className="h-3 w-28 rounded-full bg-slate-200" />
                        <div className="h-3 w-full rounded-full bg-slate-100" />
                        <div className="h-3 w-5/6 rounded-full bg-slate-100" />
                      </div>
                    </div>

                    <div className="rounded-[16px] border border-slate-200/70 bg-white/96 p-3 shadow-sm">
                      <p className="text-[14px] font-semibold text-slate-800">
                        서비스 중단 기준 불명확
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-slate-500">
                        서비스 중단 관련 조항이 모호하여 해석 차이가 생길 수 있습니다.
                      </p>
                    </div>

                    <div className="rounded-[16px] border border-slate-200/70 bg-white/96 p-3 shadow-sm">
                      <p className="text-[14px] font-semibold text-slate-800">
                        손해 배상 범위 제한
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-slate-500">
                        책임 범위가 과도하게 제한되어 사용자에게 불리할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop preview only */}
            <div className="relative mx-auto hidden w-full max-w-[820px] lg:block">
              <div
                className="absolute -left-12 top-10 h-52 w-52 rounded-full blur-3xl"
                style={{ backgroundColor: 'rgba(95,117,177,0.18)' }}
              />
              <div
                className="absolute -right-10 bottom-8 h-60 w-60 rounded-full blur-3xl"
                style={{ backgroundColor: 'rgba(125,149,246,0.16)' }}
              />

              <div
                className="relative rounded-[40px] border border-white/90 bg-white/82 p-6 backdrop-blur"
                style={{ boxShadow: '0 34px 100px rgba(15,23,42,0.12)' }}
              >
                <div className="mb-5 flex items-center justify-between rounded-[20px] bg-slate-50/95 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#6C80DD]" />
                    <span className="text-[14px] font-medium text-slate-600">
                      Contract_Analysis.pdf
                    </span>
                  </div>

                  <div className="flex gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-[1fr_220px]">
                  <div className="space-y-4">
                    <div className="rounded-[24px] bg-slate-50/90 p-6">
                      <div className="space-y-3.5">
                        <div className="h-3.5 w-36 rounded-full bg-slate-200" />
                        <div className="h-3.5 w-full rounded-full bg-slate-100" />
                        <div className="h-3.5 w-5/6 rounded-full bg-slate-100" />
                        <div className="h-3.5 w-2/3 rounded-full bg-slate-100" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-[22px] border border-slate-200/70 bg-white/96 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-[11px] font-semibold text-red-400">
                            1
                          </div>
                          <div>
                            <p className="text-[15px] font-semibold text-slate-800">
                              서비스 중단 기준 불명확
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-slate-500">
                              서비스 중단 관련 조항이 모호하여
                              <br />
                              해석 차이가 생길 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-slate-200/70 bg-white/96 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-[11px] font-semibold text-amber-500">
                            2
                          </div>
                          <div>
                            <p className="text-[15px] font-semibold text-slate-800">
                              손해 배상 범위 제한
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-slate-500">
                              책임 범위가 과도하게 제한되어 사
                              <br />
                              용자에게 불리할 수 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[22px] border border-slate-200/70 bg-white/96 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-500">
                            3
                          </div>
                          <div>
                            <p className="text-[15px] font-semibold text-slate-800">
                              계약 해지 조항 확인 필요
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-slate-500">
                              해지 시점과 절차가 구체적이지 않
                              <br />
                              아 분쟁 가능성이 있습니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div
                      className="w-full rounded-[30px] border border-white/90 bg-white/95 p-5"
                      style={{ boxShadow: '0 20px 46px rgba(102,122,242,0.12)' }}
                    >
                      <p className="text-[14px] font-medium text-slate-500">
                        Risk Score
                      </p>

                      <div className="mt-6 flex justify-center">
                        <div
                          className="relative flex h-[132px] w-[132px] items-center justify-center rounded-full"
                          style={{
                            background:
                              'conic-gradient(#7C90EA 0 65%, #E8EDFC 65% 100%)',
                          }}
                        >
                          <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full bg-white text-[36px] font-semibold text-slate-900">
                            65
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 rounded-[18px] bg-slate-50 px-4 py-4 text-center">
                        <p className="text-[11px] tracking-[0.28em] text-slate-300">
                          STATUS
                        </p>
                        <p className="mt-1 text-[15px] font-medium text-slate-700">
                          분석 진행 중
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-[13px] leading-6 text-slate-400 lg:text-left">
                복잡한 계약서도 더 빠르고 안전하게 검토할 수 있도록 설계된 스마트 계약 분석 서비스
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}