import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, Check, Loader2 } from 'lucide-react';
import client from '../../api/client';

type Message = {
  role: 'bot';
  text: string;
};

type Step = {
  label: string;
  message: string;
};

export function Loading() {
  const { contractId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: '분석을 시작할게요. 업로드한 계약서를 차근차근 확인하고 있어요.',
    },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const isStarted = useRef(false);

  const steps: Step[] = useMemo(
    () => [
      { label: '계약서 확인', message: '업로드된 계약서를 확인하고 있어요.' },
      { label: '텍스트 추출', message: '문서에서 텍스트와 주요 정보를 추출하고 있어요.' },
      { label: '조항 분석', message: '계약 조항을 하나씩 읽고 핵심 내용을 분석하고 있어요.' },
      { label: '위험 요소 점검', message: '주의가 필요한 조항과 잠재적인 위험 요소를 찾고 있어요.' },
      { label: '결과 정리', message: '최종 분석 결과를 보기 쉽게 정리하고 있어요.' },
    ],
    []
  );

  useEffect(() => {
    if (isStarted.current) return;
    isStarted.current = true;

    let pollInterval: number | undefined;
    const timers: number[] = [];

    const startAnalysis = async () => {
      if (!contractId) return;

      try {
        // ✅ 분석 시작 요청 API
        // 프론트는 /analyze가 아니라 /request-analysis를 호출해야 함
        await client.post(
          `/api/v1/contracts/${contractId}/analyze`,
          {},
          {
            timeout: 300000,
          }
        );

        steps.forEach((step, index) => {
          if (index > 0 && index < steps.length - 1) {
            const timer = window.setTimeout(() => {
              setCurrentStep(index);

              setMessages((prev) => {
                if (prev.some((m) => m.text === step.message)) return prev;

                return [
                  ...prev,
                  {
                    role: 'bot',
                    text: step.message,
                  },
                ];
              });
            }, index * 2500);

            timers.push(timer);
          }
        });

        pollInterval = window.setInterval(async () => {
          try {
            const response = await client.get(`/api/v1/contracts/${contractId}`);
            const data = response.data;

            const status = data.status?.toLowerCase();

            if (status === 'completed' || status === 'success') {
              if (pollInterval) clearInterval(pollInterval);
              timers.forEach((timer) => window.clearTimeout(timer));
              setCurrentStep(steps.length - 1);
              setMessages((prev) => {
                if (prev.some((m) => m.text.includes('결과 화면으로 이동'))) return prev;
                return [...prev, { role: 'bot', text: '분석이 완료되었어요. 결과 화면으로 이동할게요.' }];
              });
              window.setTimeout(() => {
                navigate(`/result/${contractId}`, { replace: true });
              }, 1500);
            } else if (status === 'failed') {
              if (pollInterval) clearInterval(pollInterval);
              timers.forEach((timer) => window.clearTimeout(timer));
              setMessages((prev) => [
                ...prev,
                { role: 'bot', text: `분석 중 오류가 발생했어요. 홈으로 돌아가 다시 시도해주세요.\n원인: ${data.analysis_error || '알 수 없는 오류'}` },
              ]);
            }
          } catch (error) {
            console.error('상태 확인 실패 (폴링 중):', error);
          }
        }, 3000);
      } catch (err: any) {
        if (err.code === 'ECONNABORTED') {
          console.error('분석 요청 타임아웃 발생 (5분 초과)');
        } else {
          console.error('분석 시작 실패:', err);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            text: '분석 요청 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
          },
        ]);
      }
    };

    startAnalysis();

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));

      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [contractId, navigate, steps]);

  const progress = Math.min(((currentStep + 1) / steps.length) * 100, 100);

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.18) 0%, rgba(95,117,177,0.06) 24%, transparent 48%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24">
        <header className="flex h-[72px] items-center sm:h-20">
          <div className="w-[52px] sm:w-[72px]" aria-hidden="true" />

          <div className="flex-1 text-center">
            <span className="pointer-events-none text-[18px] font-medium tracking-[0.18em] text-slate-700 sm:text-[22px] lg:text-[24px]">
              CLAIR.
            </span>
          </div>

          <div className="w-[52px] sm:w-[72px]" aria-hidden="true" />
        </header>

        <main className="flex flex-1 items-center justify-center pb-10 sm:pb-12">
          <section className="mx-auto w-full max-w-[1080px]">
            <div className="mx-auto max-w-[560px] text-center">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/90 bg-white/82 px-4 py-2 text-[12px] font-medium text-slate-500 shadow-sm backdrop-blur sm:mb-6 sm:px-5 sm:py-2.5 sm:text-[13px]">
                Loading
              </div>

              <h1 className="text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-slate-900 sm:text-[40px] lg:text-[52px]">
                계약서를 분석하고 있어요
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 sm:text-[16px] sm:leading-8 lg:text-[18px]">
                AI가 핵심 조항과 위험 요소를 빠르게 정리하고 있습니다.
              </p>
            </div>

            <div className="mx-auto mt-7 hidden overflow-hidden rounded-[28px] border border-white/90 bg-white/80 shadow-[0_30px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:rounded-[32px] lg:block">
              <div className="border-b border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(238,242,249,0.72)_100%)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="relative flex h-11 w-11 items-center justify-center rounded-[16px] text-white shadow-lg sm:h-12 sm:w-12 sm:rounded-[18px]"
                    style={{
                      background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                    }}
                  >
                    <Bot size={20} className="sm:h-6 sm:w-6" />
                    <span className="absolute inset-0 animate-spin rounded-[16px] border-2 border-transparent border-t-[#5B70E8] sm:rounded-[18px]" />
                  </div>

                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">
                      AI 어시스턴트
                    </h2>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      <span className="text-[13px] text-slate-500">분석 진행 중</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="border-b border-slate-100/80 p-4 sm:p-6 lg:border-b-0 lg:border-r">
                  <div className="rounded-[24px] border border-slate-100 bg-[#F8FAFF] p-4 sm:p-5">
                    <div className="mb-5 flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin text-[#6C80DD]" />
                      <h3 className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">
                        진행 상황
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {steps.map((step, index) => {
                        const isCompleted = index <= currentStep;

                        return (
                          <div
                            key={step.label}
                            className="flex items-center gap-3 rounded-[18px] bg-white px-4 py-3"
                          >
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-[12px] transition-all ${
                                isCompleted
                                  ? 'bg-gradient-to-br from-[#667AF2] to-[#8097F8] text-white shadow-sm'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {isCompleted ? (
                                <Check size={16} />
                              ) : (
                                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                              )}
                            </div>

                            <p
                              className={`text-[14px] font-medium sm:text-[15px] ${
                                isCompleted ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 rounded-[20px] border border-white/90 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[14px] font-medium text-slate-500">
                          전체 진행률
                        </span>
                        <span className="text-[15px] font-semibold text-slate-900">
                          {Math.round(progress)}%
                        </span>
                      </div>

                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: `${progress}%`,
                            background:
                              'linear-gradient(90deg, #667AF2 0%, #8097F8 55%, #8ED8CC 100%)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex min-h-[360px] flex-col bg-white/30">
                  <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className="flex justify-start gap-3 animate-in fade-in slide-in-from-bottom-2"
                      >
                        <div
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px] text-white shadow-sm"
                          style={{
                            background:
                              'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                          }}
                        >
                          <Bot size={16} />
                        </div>

                        <div className="max-w-[82%] rounded-[20px] rounded-tl-[8px] border border-white/90 bg-white px-4 py-3 text-[14px] leading-6 text-slate-800 shadow-sm sm:max-w-[75%] sm:text-[15px]">
                          {message.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 bg-white/70 px-4 py-4 text-center text-sm text-slate-500 sm:px-6">
                    <Loader2 size={16} className="mr-2 inline animate-spin text-[#6C80DD]" />
                    결과 화면으로 이동할 준비를 하고 있어요.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-[28px] border border-white/90 bg-white/80 p-6 text-center shadow-[0_24px_50px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden">
              <Loader2 size={28} className="mx-auto animate-spin text-[#6C80DD]" />

              <p className="mt-4 text-[15px] font-semibold text-slate-900">
                {steps[currentStep]?.label}
              </p>

              <p className="mt-2 text-[14px] leading-6 text-slate-500">
                {steps[currentStep]?.message}
              </p>

              <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${progress}%`,
                    background:
                      'linear-gradient(90deg, #667AF2 0%, #8097F8 55%, #8ED8CC 100%)',
                  }}
                />
              </div>

              <p className="mt-3 text-[13px] text-slate-500">{Math.round(progress)}%</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}