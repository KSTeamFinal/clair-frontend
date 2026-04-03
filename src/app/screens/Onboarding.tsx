import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';

const onboardingHighlights = [
  {
    title: '계약서 업로드',
    description: 'PDF, 이미지, 텍스트 형식으로\n간편하게 계약서를 업로드하세요.',
  },
  {
    title: 'AI 자동 분석',
    description: '인공지능이 계약서를 꼼꼼히\n분석하고 위험 요소를 찾아냅니다.',
  },
  {
    title: '상세 리포트',
    description: '분석 결과와 AI 챗봇으로\n궁금한 점을 바로 해결하세요.',
  },
];

export function Onboarding() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleStart = () => {
    navigate('/signup');
  };

  const handleSkip = () => {
    navigate('/signup');
  };

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
            onClick={() => navigate('/')}
            className="text-[18px] font-medium tracking-[0.18em] text-slate-700 hover:opacity-80 sm:text-[22px] lg:text-[24px]"
          >
            CLAIR.
          </button>

          <button
            onClick={handleSkip}
            className="text-[14px] font-medium text-slate-500 hover:text-slate-800 sm:text-[15px]"
          >
            건너뛰기
          </button>
        </header>

        {/* Main */}
        <main className="flex flex-1 items-center py-6 sm:py-8 lg:py-0">
          <section className="mx-auto flex w-full max-w-[1180px] flex-col items-center">

            {/* Title */}
            <div className="max-w-[980px] text-center">
              <h1 className="text-[28px] font-semibold leading-[1.22] tracking-[-0.04em] text-slate-900 sm:text-[36px] md:text-[44px] lg:text-[64px]">
                <span className="block sm:inline">CLAIR를 통해</span>{' '}
                <span className="block sm:inline">복잡한 계약서를</span>
                <br className="hidden sm:block" />
                <span className="block sm:inline">쉽고 빠르게 분석하세요</span>
            </h1>

              <p className="mx-auto mt-5 max-w-[900px] text-[15px] leading-7 text-slate-500 sm:text-[17px] sm:leading-8 lg:mt-7 lg:text-[18px] lg:leading-9">
                PDF, 이미지, 텍스트 형식의 계약서를 간편하게 업로드하고,
                인공지능을 통해 위험 요소를 자동 분석하여 상세 리포트를 제공합니다.
              </p>
            </div>

            {/* Desktop 카드 */}
            <div className="mt-10 hidden w-full lg:block">
              <div
                className="grid grid-cols-3 overflow-hidden rounded-[30px] border border-white/90 bg-white/78 backdrop-blur"
                style={{ boxShadow: '0 28px 80px rgba(15,23,42,0.10)' }}
              >
                {onboardingHighlights.map((item, index) => (
                  <div
                    key={item.title}
                    className={`relative px-8 py-9 ${
                      index !== onboardingHighlights.length - 1
                        ? 'border-r border-slate-200/60'
                        : ''
                    }`}
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7ECFB] text-[#6C80DD]">
                        <Check size={20} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-[20px] font-semibold text-slate-900">
                        {item.title}
                      </h2>
                    </div>

                    <p className="whitespace-pre-line text-[15px] leading-8 text-slate-500">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile 카드 */}
            <div className="mt-8 grid w-full gap-3 lg:hidden sm:mt-10 sm:gap-4">
              {onboardingHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-white/90 bg-white/82 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7ECFB] text-[#6C80DD]">
                      <Check size={18} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-[19px] font-semibold text-slate-900">
                      {item.title}
                    </h2>
                  </div>

                  <p className="whitespace-pre-line text-[14px] leading-7 text-slate-500">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

          </section>
        </main>

        {/* Bottom */}
        <div className="pb-4 pt-2 sm:pb-6 lg:pb-8">
          <div className="mx-auto grid w-full max-w-[1080px] grid-cols-[52px_1fr_52px] items-center gap-3 sm:grid-cols-[56px_1fr_56px] sm:gap-4">
            <button
              onClick={handleBack}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 shadow-sm transition-colors hover:bg-gray-50 sm:h-[56px] sm:w-[56px]"
              aria-label="이전"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={handleStart}
              className="h-[52px] w-full rounded-[18px] text-white font-semibold transition-all hover:-translate-y-0.5 sm:h-[56px] sm:rounded-[20px] lg:h-[64px] lg:rounded-[24px]"
              style={{
                background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                boxShadow: '0 18px 38px rgba(102,122,242,0.24)',
              }}
            >
              시작하기
            </button>

            <div aria-hidden="true" />
          </div>
      </div>

      </div>
    </div>
  );
}