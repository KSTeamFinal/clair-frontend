// Home.tsx
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import {
  FileText,
  Clock,
  ShieldCheck,
  Bell,
  User,
  ArrowRight,
} from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  const recentDocuments = [
    {
      id: 1,
      title: '근로계약서_2024.pdf',
      date: '2024.03.15 · 5 페이지',
      status: '안정적',
      statusStyle: 'bg-emerald-50 text-emerald-600',
      timeAgo: '2일 전',
      iconStyle: 'from-[#667AF2] to-[#8097F8]',
    },
    {
      id: 2,
      title: '임대차계약서_상가.pdf',
      date: '2024.03.12 · 8 페이지',
      status: '확인 필요',
      statusStyle: 'bg-amber-50 text-amber-600',
      timeAgo: '5일 전',
      iconStyle: 'from-[#8B7FD1] to-[#A99CE5]',
    },
    {
      id: 3,
      title: '프리랜서_계약서.pdf',
      date: '2024.03.10 · 12 페이지',
      status: '안정적',
      statusStyle: 'bg-emerald-50 text-emerald-600',
      timeAgo: '1주 전',
      iconStyle: 'from-orange-500 to-red-500',
    },
  ];

  const stats = [
    {
      id: 1,
      label: '총 분석 건수',
      value: '24',
      description: '+3 이번 주',
      descriptionClass: 'text-emerald-600',
      icon: <FileText size={20} className="text-[#6C80DD]" />,
      iconBg: 'bg-[#EEF2F9]',
    },
    {
      id: 2,
      label: '계약 안정도',
      value: '85%',
      description: '최근 분석 문서 평균',
      descriptionClass: 'text-slate-500',
      icon: <ShieldCheck size={20} className="text-sky-600" />,
      iconBg: 'bg-sky-50',
    },
    {
      id: 3,
      label: 'AI로 절약한 시간',
      value: '48시간',
      description: '직접 검토 대비 이번 달',
      descriptionClass: 'text-slate-500',
      icon: <Clock size={20} className="text-violet-600" />,
      iconBg: 'bg-violet-50',
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.18) 0%, rgba(95,117,177,0.06) 24%, transparent 48%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <header className="flex h-16 items-center sm:h-[72px] md:h-20">
          <div className="flex w-[48px] items-center justify-start sm:w-[56px]">
            <button
              onClick={() => navigate('/notifications')} 
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur sm:h-11 sm:w-11">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>
          </div>

          <div className="flex-1 text-center">
            <span className="pointer-events-none text-[16px] font-medium tracking-[0.18em] text-slate-700 sm:text-[18px] md:text-[20px] lg:text-[24px]">
              CLAIR.
            </span>
          </div>

          <div className="flex w-[48px] items-center justify-end sm:w-[56px]">
            <button
              onClick = {() => navigate('/settings')} 
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur sm:h-11 sm:w-11">
              <User size={18} />
            </button>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-64px)] items-center justify-center py-3 sm:min-h-[calc(100vh-72px)] sm:py-4 md:min-h-[calc(100vh-80px)] md:py-6">
          <div className="w-full max-w-[1180px]">
            <section className="relative overflow-hidden rounded-[24px] border border-white/90 bg-white/65 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[28px] sm:p-6 md:p-8 lg:rounded-[34px] lg:p-10">
              <div className="relative z-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-8">
                <div className="flex flex-col justify-center">
                  <div className="inline-flex w-fit items-center rounded-full border border-white/90 bg-white/85 px-3 py-1.5 text-[11px] text-slate-500 sm:px-4 sm:py-2 sm:text-[12px]">
                    Dashboard
                  </div>

                  <h1 className="mt-4 text-[24px] font-semibold leading-[1.25] text-slate-900 sm:text-[30px] md:text-[38px] lg:text-[52px]">
                    안녕하세요,
                    <br />
                    오늘도 안전한 계약을 시작해볼까요?
                  </h1>

                  <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-slate-500 sm:text-[14px] md:text-[15px] lg:text-[16px]">
                    계약서를 업로드하면 AI가 핵심 조항을 빠르게 분석해드려요.
                  </p>

                  <div className="mt-6">
                    <button
                      onClick={() => navigate('/upload')}
                      className="inline-flex h-[56px] min-w-[184px] items-center justify-center gap-2 whitespace-nowrap rounded-[20px] px-6 text-[15px] font-semibold leading-none text-white shadow-md transition hover:scale-[1.02] active:scale-[0.98] sm:h-[58px] sm:min-w-[198px] sm:px-7 sm:text-[16px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                      }}
                    >
                      <span className="whitespace-nowrap">계약서 업로드</span>
                      <ArrowRight size={17} className="shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="hidden lg:grid gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.id}
                      className="rounded-[20px] bg-white/90 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">{stat.label}</p>
                          <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                            {stat.value}
                          </h3>
                          <p className={`mt-2 text-sm ${stat.descriptionClass}`}>
                            {stat.description}
                          </p>
                        </div>

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.iconBg}`}
                        >
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-4 sm:mt-5 md:mt-6">
              <div className="lg:hidden">
                <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-3 pb-2 sm:gap-4">
                    {stats.map((stat) => (
                      <div
                        key={stat.id}
                        className="min-w-[240px] max-w-[240px] rounded-[18px] bg-white/92 p-4 shadow-sm sm:min-w-[260px] sm:max-w-[260px] sm:rounded-[20px] sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                            <h3 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
                              {stat.value}
                            </h3>
                            <p className={`mt-2 text-sm ${stat.descriptionClass}`}>
                              {stat.description}
                            </p>
                          </div>

                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
                          >
                            {stat.icon}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="rounded-[20px] bg-white/92 p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                          {stat.value}
                        </h3>
                        <p className={`mt-2 text-sm ${stat.descriptionClass}`}>
                          {stat.description}
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg}`}
                      >
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-4 sm:mt-5 md:mt-6">
              <div className="rounded-[22px] bg-white/92 p-5 shadow-sm sm:rounded-[24px] sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    최근 문서
                  </h2>
                  <button className="text-sm font-medium text-[#667AF2]">
                    전체보기
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-[16px] bg-[#F8FAFF] p-4 transition hover:bg-[#F2F6FF] sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                            {doc.title}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                            {doc.date}
                          </p>

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${doc.statusStyle}`}
                            >
                              {doc.status}
                            </span>
                            <span className="text-xs text-slate-400">
                              {doc.timeAgo}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${doc.iconStyle}`}
                        >
                          <FileText size={18} className="text-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}