import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  MessageCircle,
  FileText,
} from 'lucide-react';

type SettingItem = {
  id: number;
  label: string;
  value?: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
};

type UserInfo = {
  nickname: string;
  email: string;
};

const profileItems: SettingItem[] = [
  { id: 1, label: '내 정보 조회', icon: User, path: '/profile' },
  { id: 2, label: '닉네임 변경', icon: User, path: '/profile' },
  { id: 3, label: '비밀번호 변경', icon: User, path: '/profile' },
];

const chatSessionItems: SettingItem[] = [
  { id: 4, label: '채팅 세션 생성', icon: MessageCircle, path: '/chat-session' },
  { id: 5, label: '채팅 세션 이력 확인', icon: MessageCircle, path: '/chat-session' },
  { id: 6, label: '채팅 세션 삭제', icon: MessageCircle, path: '/chat-session' },
  { id: 7, label: '채팅 세션 상세', icon: MessageCircle, path: '/chat-session' },
  { id: 8, label: '메시지 전송', icon: MessageCircle, path: '/chat-session' },
  { id: 9, label: '대화 내역 조회', icon: MessageCircle, path: '/chat-session' },
];

const contractItems: SettingItem[] = [
  { id: 10, label: '계약서 업로드', icon: FileText, path: '/contracts/manage' },
  { id: 11, label: '계약서 목록 조회', icon: FileText, path: '/contracts/manage' },
  { id: 12, label: '계약서 상세 조회', icon: FileText, path: '/contracts/manage' },
  { id: 13, label: '계약서 삭제', icon: FileText, path: '/contracts/manage' },
  { id: 14, label: '계약서 분석 요청', icon: FileText, path: '/contracts/manage' },
];

function SettingRow({ item }: { item: SettingItem }) {
  const navigate = useNavigate();
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => item.path && navigate(item.path)}
      className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-[#F8FAFF] sm:gap-[18px] sm:px-[18px] sm:py-[18px]"
    >
      <div className="my-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F9]">
        <Icon className="h-[14px] w-[14px] text-[#6C80DD]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-slate-900 sm:text-[14px]">
          {item.label}
        </p>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-2.5">
        {item.value && (
          <span className="text-[11px] font-medium text-slate-400 sm:text-[12px]">
            {item.value}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-slate-400" />
      </div>
    </button>
  );
}

function SettingSection({
  title,
  items,
  open,
  onToggle,
}: {
  title: string;
  items: SettingItem[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="mt-2.5 sm:mt-3.5 md:mt-4">
      <div className="rounded-[16px] bg-white/92 p-3.5 shadow-sm sm:rounded-[18px] sm:p-4">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div>
            <h2 className="text-[14px] font-semibold text-slate-900 sm:text-[15px]">
              {title}
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
              {items.length} items
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#EEF2F9] px-2 py-0.5 text-[9px] font-medium text-[#6C80DD] sm:px-2.5 sm:py-1 sm:text-[10px]">
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
          <div className="mt-4 overflow-hidden rounded-[16px] border border-slate-100 bg-white sm:rounded-[18px]">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={index !== items.length - 1 ? 'border-b border-slate-100' : ''}
              >
                <SettingRow item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);

  const [profileSummary, setProfileSummary] = useState({
    name: '',
    email: '',
    role: '설정 및 관리',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await client.get('/api/v1/auth/me');

        setProfileSummary({
          name: res.data.nickname || '사용자',
          email: res.data.email || '',
          role: '설정 및 관리',
        });
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    fetchUserInfo();
  }, []);

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

          <div className="flex w-[48px] items-center justify-end sm:w-[56px]" />
        </header>

        <main className="flex flex-1 items-center justify-center py-4 sm:py-5 md:py-6">
          <div className="w-full max-w-[760px] lg:max-w-[820px]">
            <section className="relative overflow-hidden rounded-[18px] border border-white/90 bg-white/65 p-3.5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[22px] sm:p-4 md:p-5">
              <div className="relative z-10">
                <div className="inline-flex w-fit items-center rounded-full border border-white/90 bg-white/85 px-3 py-1 text-[10px] text-slate-500 sm:px-3.5 sm:text-[11px]">
                  Settings
                </div>

                <div className="mt-2.5 flex items-center gap-2.5 sm:gap-3">
                  <h1 className="text-[22px] font-semibold leading-[1.15] text-slate-900 sm:text-[28px] md:text-[34px]">
                    설정
                  </h1>
                </div>

                <p className="mt-2 max-w-[520px] text-[11px] leading-5 text-slate-500 sm:text-[12px] sm:leading-5 md:text-[13px]">
                  프로필 정보 관리, 채팅 세션 관리, 계약서 관리 기능을 한곳에서 빠르게 확인하고 이동할 수 있어요.
                </p>

                <div className="mt-3 rounded-[16px] border border-white/90 bg-white/92 p-3 shadow-sm sm:rounded-[18px] sm:p-3.5">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="flex w-full items-center gap-4 text-left sm:gap-[18px]"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#667AF2] to-[#8097F8] text-white shadow-sm sm:h-11 sm:w-11">
                      <span className="text-sm font-semibold sm:text-base">
                        {profileSummary.name?.charAt(0)}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                        {profileSummary.name}
                      </h2>

                      <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-[12px]">
                        {profileSummary.email}
                      </p>

                      <p className="mt-1 inline-flex rounded-full bg-[#EEF2F9] px-2 py-0.5 text-[9px] font-medium text-[#6C80DD] sm:text-[10px]">
                        {profileSummary.role}
                      </p>
                    </div>

                    <div className="ml-3 shrink-0">
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>
                </div>
              </div>
            </section>

            <SettingSection
              title="프로필 관리"
              items={profileItems}
              open={profileOpen}
              onToggle={() => setProfileOpen((prev) => !prev)}
            />

            <SettingSection
              title="채팅 세션 관리"
              items={chatSessionItems}
              open={chatOpen}
              onToggle={() => setChatOpen((prev) => !prev)}
            />

            <SettingSection
              title="계약서 관리"
              items={contractItems}
              open={contractOpen}
              onToggle={() => setContractOpen((prev) => !prev)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}