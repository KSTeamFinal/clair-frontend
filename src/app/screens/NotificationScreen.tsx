import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Bell,
  Sparkles,
  ChevronDown,
  FileCheck,
  Share2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import client from '../../api/client';

type NotificationItem = {
  id: number;
  notification_type: string;
  title: string;
  content: string;
  is_read: boolean;
  contract_id?: number | null;
  created_at: string;
};

function formatNotificationTime(createdAt: string) {
  if (!createdAt) return '';

  const date = new Date(createdAt);

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}

function isToday(createdAt: string) {
  const date = new Date(createdAt);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function NotificationIcon({ type }: { type: string }) {
  const normalizedType = type?.toLowerCase();
  const iconClass = 'h-4 w-4 sm:h-[18px] sm:w-[18px]';

  let icon = <Sparkles className={`${iconClass} text-[#6C80DD]`} />;

  if (
    normalizedType?.includes('analysis') ||
    normalizedType?.includes('contract') ||
    normalizedType?.includes('complete')
  ) {
    icon = <FileCheck className={`${iconClass} text-[#6C80DD]`} />;
  } else if (normalizedType?.includes('share')) {
    icon = <Share2 className={`${iconClass} text-[#6C80DD]`} />;
  } else if (
    normalizedType?.includes('risk') ||
    normalizedType?.includes('warning') ||
    normalizedType?.includes('danger')
  ) {
    icon = <AlertTriangle className={`${iconClass} text-[#6C80DD]`} />;
  } else if (normalizedType?.includes('system')) {
    icon = <Info className={`${iconClass} text-[#6C80DD]`} />;
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F9] sm:h-10 sm:w-10 sm:rounded-2xl">
      {icon}
    </div>
  );
}

function NotificationCard({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full text-left transition duration-150 active:scale-[0.985]"
    >
      <div
        className={`rounded-[16px] border p-3 backdrop-blur transition-all duration-200 sm:rounded-[18px] sm:p-3.5 ${
          item.is_read
            ? 'border-white/80 bg-white/70 opacity-80 shadow-sm hover:opacity-100'
            : 'border-[#DCE6FF] bg-white shadow-md'
        } hover:-translate-y-0.5 hover:bg-white hover:shadow-lg`}
      >
        <div className="flex items-start gap-2.5 sm:gap-3">
          <NotificationIcon type={item.notification_type} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className={`text-[13px] font-semibold leading-5 sm:text-[14px] ${
                    item.is_read ? 'text-slate-700' : 'text-slate-900'
                  }`}
                >
                  {item.title}
                </h3>

                <p
                  className={`mt-0.5 text-[11px] leading-4 sm:text-[12px] sm:leading-5 line-clamp-2 ${
                    item.is_read ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {item.content}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                {!item.is_read && (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                )}

                <span className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                  {formatNotificationTime(item.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
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
          className="flex w-full items-center justify-between gap-3 text-left transition duration-200 active:scale-[0.99]"
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
            <span className="rounded-full bg-[#EEF2F9] px-2 py-1 text-[10px] font-medium text-[#6C80DD] transition hover:bg-[#E3E9F6] sm:text-[11px]">
              {open ? '닫기' : '열기'}
            </span>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFF] transition hover:bg-[#EEF2F9]">
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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const limit = 5;

  const totalPage = Math.max(1, Math.ceil(total / limit));

  const todayItems = notifications.filter((item) =>
    isToday(item.created_at)
  );

  const weekItems = notifications.filter(
    (item) => !isToday(item.created_at)
  );

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const fetchNotifications = async (pageNumber: number) => {
    try {
      setLoading(true);

      const skip = (pageNumber - 1) * limit;

      const res = await client.get(
        `/api/v1/notifications?skip=${skip}&limit=${limit}`
      );

      setNotifications(res.data.notifications || []);
      setTotal(res.data.total || 0);
      setUnreadCount(res.data.unread_count || 0);
    } catch (error) {
      console.error('알림 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadNotification = async (item: NotificationItem) => {
    try {
      if (!item.is_read) {
        await client.patch(`/api/v1/notifications/${item.id}/read`);

        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === item.id
              ? { ...notification, is_read: true }
              : notification
          )
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      if (item.contract_id) {
        navigate(`/result/${item.contract_id}`);
      }
    } catch (error) {
      console.error('알림 클릭 처리 실패:', error);
    }
  };

  const handleReadAll = async () => {
    try {
      await client.patch('/api/v1/notifications/read-all');

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(prev + 1, totalPage));
  };

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
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95 sm:h-11 sm:w-11"
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
            <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95 sm:h-11 sm:w-11">
              <Bell size={18} />

              {!loading && unreadCount > 0 && (
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

                <div className="mt-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <h1 className="text-[22px] font-semibold leading-[1.15] text-slate-900 sm:text-[28px] md:text-[34px]">
                      알림
                    </h1>

                    <div className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-rose-500 px-2 text-[12px] font-semibold text-white sm:h-8 sm:min-w-[32px] sm:px-2.5 sm:text-[13px]">
                      {unreadCount}
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleReadAll}
                      className="shrink-0 rounded-full bg-[#EEF2F9] px-3 py-1.5 text-[11px] font-medium text-[#6C80DD] transition duration-200 hover:-translate-y-0.5 hover:bg-[#E3E9F6] hover:shadow-sm active:scale-95 sm:px-3.5 sm:text-[12px]"
                    >
                      전체 읽음
                    </button>
                  )}
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
              {loading ? (
                <div className="rounded-[16px] border border-white/90 bg-white/88 p-3 text-[12px] text-slate-400 shadow-sm backdrop-blur sm:rounded-[18px] sm:p-3.5">
                  알림을 불러오는 중이에요.
                </div>
              ) : todayItems.length > 0 ? (
                todayItems.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onClick={() => handleReadNotification(item)}
                  />
                ))
              ) : (
                <div className="rounded-[16px] border border-white/90 bg-white/88 p-3 text-[12px] text-slate-400 shadow-sm backdrop-blur sm:rounded-[18px] sm:p-3.5">
                  오늘 도착한 알림이 없어요.
                </div>
              )}
            </NotificationSection>

            <NotificationSection
              title="This week"
              count={weekItems.length}
              open={weekOpen}
              onToggle={() => setWeekOpen((prev) => !prev)}
            >
              {loading ? (
                <div className="rounded-[16px] border border-white/90 bg-white/88 p-3 text-[12px] text-slate-400 shadow-sm backdrop-blur sm:rounded-[18px] sm:p-3.5">
                  알림을 불러오는 중이에요.
                </div>
              ) : weekItems.length > 0 ? (
                weekItems.map((item) => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    onClick={() => handleReadNotification(item)}
                  />
                ))
              ) : (
                <div className="rounded-[16px] border border-white/90 bg-white/88 p-3 text-[12px] text-slate-400 shadow-sm backdrop-blur sm:rounded-[18px] sm:p-3.5">
                  이번 주 알림이 없어요.
                </div>
              )}
            </NotificationSection>

            {!loading && total > limit && (
              <div className="mt-4 flex items-center justify-center gap-3 sm:mt-5 sm:gap-4 md:gap-4">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="inline-flex h-9 min-w-[58px] items-center justify-center rounded-full bg-white/90 px-4 text-[13px] font-medium leading-none text-slate-500 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:h-10 sm:min-w-[70px] sm:px-5 sm:text-[14px] md:h-10 md:min-w-[74px]"
                >
                  이전
                </button>

                <span className="inline-flex h-9 min-w-[64px] items-center justify-center rounded-full bg-[#EEF2F9] px-4 text-[13px] font-semibold leading-none text-[#6C80DD] shadow-sm sm:h-10 sm:min-w-[76px] sm:px-5 sm:text-[14px] md:h-10 md:min-w-[80px]">
                  {page} / {totalPage}
                </span>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={page === totalPage}
                  className="inline-flex h-9 min-w-[58px] items-center justify-center rounded-full bg-white/90 px-4 text-[13px] font-medium leading-none text-slate-500 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:h-10 sm:min-w-[70px] sm:px-5 sm:text-[14px] md:h-10 md:min-w-[74px]"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}