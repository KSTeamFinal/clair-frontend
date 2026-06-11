import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import client from '../../api/client';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircle,
  ShieldCheck,
  User,
} from 'lucide-react';

type ProfileSummary = {
  name: string;
  email: string;
  createdAt: string;
};

type SettingPanel = {
  title: string;
  description: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  iconBgClassName: string;
};

const settingPanels: SettingPanel[] = [
  {
    title: '프로필 설정',
    description: '닉네임, 프로필 사진, 비밀번호와 보안 정보를 관리해요.',
    path: '/profile',
    icon: User,
    iconClassName: 'text-[#6C80DD]',
    iconBgClassName: 'bg-[#EEF2F9]',
  },
  {
    title: '계약서 관리',
    description: '업로드한 계약서 목록과 분석 상태를 확인해요.',
    path: '/contracts/manage',
    icon: FileText,
    iconClassName: 'text-sky-600',
    iconBgClassName: 'bg-sky-50',
  },
  {
    title: '채팅 세션 관리',
    description: '계약서 상담 대화와 이전 채팅 기록을 관리해요.',
    path: '/chat-session',
    icon: MessageCircle,
    iconClassName: 'text-emerald-600',
    iconBgClassName: 'bg-emerald-50',
  },
];

function formatDate(value: string) {
  if (!value) return '가입일 정보 없음';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function SettingPanelButton({ panel }: { panel: SettingPanel }) {
  const navigate = useNavigate();
  const Icon = panel.icon;

  return (
    <button
      type="button"
      onClick={() => navigate(panel.path)}
      className="flex w-full items-center rounded-[18px] border border-white/90 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-white hover:shadow-md"
      style={{
        backgroundColor: '#ffffff',
        gap: '24px',
        padding: '24px 28px 24px 40px',
      }}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${panel.iconBgClassName}`}
      >
        <Icon className={`h-[18px] w-[18px] ${panel.iconClassName}`} />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">
          {panel.title}
        </h2>
        <p className="mt-1 text-[12px] leading-5 text-slate-500 sm:text-[13px]">
          {panel.description}
        </p>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </button>
  );
}

export default function SettingsScreen() {
  const navigate = useNavigate();

  const [profileSummary, setProfileSummary] = useState<ProfileSummary>({
    name: '사용자',
    email: '',
    createdAt: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) setProfileImage(savedImage);

    const fetchUserInfo = async () => {
      try {
        const res = await client.get('/api/v1/auth/me');
        const user = res.data?.user ?? res.data ?? {};
        const serverImage = user.profile_image || user.profileImage;

        setProfileSummary({
          name: user.nickname || user.name || '사용자',
          email: user.email || '',
          createdAt: user.created_at || user.createdAt || '',
        });

        if (serverImage) {
          setProfileImage(serverImage);
          localStorage.setItem('profileImage', serverImage);
        }
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);

        const stored = localStorage.getItem('userInfo');
        if (!stored) return;

        try {
          const user = JSON.parse(stored);
          setProfileSummary({
            name: user.nickname || user.name || '사용자',
            email: user.email || '',
            createdAt: user.created_at || user.createdAt || '',
          });
        } catch (parseError) {
          console.error('저장된 유저 정보 파싱 실패:', parseError);
        }
      }
    };

    fetchUserInfo();
  }, []);

  const initial = profileSummary.name.trim().charAt(0) || 'C';

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

        <main className="flex flex-1 justify-center py-4 sm:py-6 md:py-8">
          <div className="w-full max-w-[760px] lg:max-w-[820px]">
            <section className="rounded-[22px] border border-white/90 bg-white/65 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-7 md:p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#667AF2] to-[#8097F8] text-white shadow-lg shadow-indigo-200/70 sm:h-44 sm:w-44">
                  {profileImage ? (
                    <img src={profileImage} alt="프로필" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[52px] font-semibold sm:text-[64px]">
                      {initial}
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <h1 className="text-[24px] font-semibold leading-tight text-slate-900 sm:text-[30px]">
                    프로필
                  </h1>
                  <p className="mt-2 text-[13px] leading-5 text-slate-500 sm:text-[14px]">
                    계정 정보와 관리 메뉴를 확인해보세요.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[18px] border border-white/90 bg-white/92 p-4 text-left shadow-sm sm:mt-5 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">
                  계정 정보
                </h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  정상 이용 중
                </span>
              </div>

              <div className="grid gap-3">
                <div className="min-w-0 rounded-2xl bg-slate-50/80 p-3">
                  <p className="text-[11px] font-medium text-slate-400">이름</p>
                  <p className="mt-1 truncate text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                    {profileSummary.name}
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl bg-slate-50/80 p-3">
                  <p className="text-[11px] font-medium text-slate-400">이메일</p>
                  <p className="mt-1 truncate text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                    {profileSummary.email || '이메일 정보 없음'}
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl bg-slate-50/80 p-3">
                  <p className="text-[11px] font-medium text-slate-400">가입일</p>
                  <p className="mt-1 text-[13px] font-medium text-slate-600 sm:text-[14px]">
                    {formatDate(profileSummary.createdAt)}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-4 grid w-full gap-4 sm:mt-5">
              {settingPanels.map((panel) => (
                <SettingPanelButton key={panel.path} panel={panel} />
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
