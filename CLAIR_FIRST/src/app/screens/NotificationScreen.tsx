import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, Sparkles, ChevronDown } from 'lucide-react';
import client from '../../api/client';

type NotificationItem = {
  id: number;
  section: 'today' | 'week';
  title: string;
  description: string;
  isUnread?: boolean;
  time?: string;
};

const notifications: NotificationItem[] = [
  {
    id: 1,
    section: 'today',
    title: '계약서 검토가 완료되었어요',
    description: '핵심 위험 조항과 수정 포인트를 확인해보세요.',
    isUnread: true,
    time: '방금 전',
  },
  {
    id: 2,
    section: 'today',
    title: '새 템플릿 추천이 도착했어요',
    description: '자주 사용하는 계약 유형 기반 추천 템플릿이에요.',
    isUnread: true,
    time: '12분 전',
  },
  {
    id: 3,
    section: 'today',
    title: '보안 점검이 완료되었어요',
    description: '계정과 문서 접근 상태가 안전하게 유지되고 있어요.',
    isUnread: true,
    time: '1시간 전',
  },
  {
    id: 4,
    section: 'week',
    title: '이번 주 분석 리포트가 업데이트되었어요',
    description: '위험 조항 비율과 평균 안정도를 볼 수 있어요.',
    time: '어제',
  },
  {
    id: 5,
    section: 'week',
    title: '다시 확인하면 좋은 계약서가 있어요',
    description: '재검토를 추천하는 문서를 모아두었어요.',
    time: '2일 전',
  },
  {
    id: 6,
    section: 'week',
    title: '계약서 관리 화면이 새로 정리되었어요',
    description: '문서를 더 쉽게 찾고 비교할 수 있어요.',
    time: '3일 전',
  },
  {
    id: 7,
    section: 'week',
    title: '맞춤 검토 팁이 준비되었어요',
    description: '자주 놓치는 문구 중심 점검 포인트예요.',
    time: '이번 주',
  },
];

function NotificationIcon() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F9] sm:h-10 sm:w-10 sm:rounded-2xl">
      <Sparkles className="h-4 w-4 text-[#6C80DD] sm:h-[18px] sm:w-[18px]" />
    </div>
  );
}

function NotificationCard({ item }: { item: NotificationItem }) {
  return (
    <div className="rounded-[16px] border border-white/90 bg-white/88 p-3 shadow-sm backdrop-blur transition hover:bg-white sm:rounded-[18px] sm:p-3.5">
      <div className="flex items-start gap-2.5 sm:gap-3">
        <NotificationIcon />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold leading-5 text-slate-900 sm:text-[14px]">
                {item.title}
              </h3>
              <p className="mt-0.5 text-[11px] leading-4 text-slate-500 sm:text-[12px] sm:leading-5 line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
              {item.isUnread && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
              <span className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                {item.time}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type SectionProps = {
  title: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function NotificationSection({
  title,
  count,
  open,
  onToggle,
  children,
}: SectionProps) {
  return (
    <section className="mt-3 sm:mt-4 md:mt-5">
      <div className="rounded-[18px] bg-white/92 p-3.5 shadow-sm sm:rounded-[20px] sm:p-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900 sm:text-base">
              {title}
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
              {count} items
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#EEF2F9] px-2 py-1 text-[10px] font-medium text-[#6C80DD] sm:text-[11px]">
              {open ? '닫기' : '열기'}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFF]">
              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform ${
                  open ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </button>

        {open && (
          <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export default function NotificationScreen() {
  const navigate = useNavigate();
  const [todayOpen, setTodayOpen] = useState(true);
  const [weekOpen, setWeekOpen] = useState(false);

  const todayItems = useMemo(
    () => notifications.filter((item) => item.section === 'today'),
    []
  );

  const weekItems = useMemo(
    () => notifications.filter((item) => item.section === 'week'),
    []
  );

  const unreadCount = notifications.filter((item) => item.isUnread).length;

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
              onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white sm:h-11 sm:w-11"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 text-center">
            <span className="pointer-events-none text-[16px] font-medium tracking-[0.18em] text-slate-700 sm:text-[18px] md:text-[20px] lg:text-[24px]">
              CLAIR.
            </span>
          </div>

          <div className="flex w-[48px] items-center justify-end sm:w-[56px]">
            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur sm:h-11 sm:w-11">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-64px)] flex-1 items-center justify-center py-3 sm:min-h-[calc(100vh-72px)] sm:py-4 md:min-h-[calc(100vh-80px)] md:py-5">
          <div className="w-full max-w-[880px]">
            <section className="relative overflow-hidden rounded-[20px] border border-white/90 bg-white/65 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[24px] sm:p-5 md:p-6">
              <div className="relative z-10 flex flex-col gap-3">
                <div className="inline-flex w-fit items-center rounded-full border border-white/90 bg-white/85 px-3 py-1 text-[10px] text-slate-500 sm:px-3.5 sm:text-[11px]">
                  Notifications Center
                </div>

                <div className="mt-2.5 flex items-center gap-2.5 sm:gap-3">
                  <h1 className="text-[22px] font-semibold leading-[1.15] text-slate-900 sm:text-[28px] md:text-[34px]">
                    알림
                  </h1>
                  <div className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-rose-500 px-2 text-[12px] font-semibold text-white sm:h-8 sm:min-w-[32px] sm:px-2.5 sm:text-[13px]">
                    {unreadCount}
                  </div>
                </div>

                <p className="mt-2 max-w-[520px] text-[11px] leading-5 text-slate-500 sm:text-[12px] sm:leading-5 md:text-[13px]">
                  계약서 분석 결과, 보안 상태, 추천 템플릿, 시스템 업데이트까지 중요한 소식을 한곳에서 확인할 수 있어요.
                </p>
              </div>
            </section>

            <NotificationSection
              title="Today"
              count={todayItems.length}
              open={todayOpen}
              onToggle={() => setTodayOpen((prev) => !prev)}
            >
              {todayItems.map((item) => (
                <NotificationCard key={item.id} item={item} />
              ))}
            </NotificationSection>

            <NotificationSection
              title="This week"
              count={weekItems.length}
              open={weekOpen}
              onToggle={() => setWeekOpen((prev) => !prev)}
            >
              {weekItems.map((item) => (
                <NotificationCard key={item.id} item={item} />
              ))}
            </NotificationSection>
          </div>
        </main>
      </div>
    </div>
  );
}