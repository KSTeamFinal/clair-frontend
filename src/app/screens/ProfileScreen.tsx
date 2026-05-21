import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  X,
  Camera,
  Shield,
  Mail,
  User,
  Calendar,
  KeyRound,
  LogOut,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import client from '../../api/client';

export default function ProfileScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    createdAt: '',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await client.get('/api/v1/auth/me');

        setUser({
          name: res.data.nickname || res.data.name || '사용자',
          email: res.data.email || '',
          password: '',
          createdAt: res.data.created_at || res.data.createdAt || '',
        });

        setProfileImage(res.data.profile_image || res.data.profileImage || null);
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  const handleResetImage = () => {
    setProfileImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    setIsEdit(false);
    setShowSaveToast(true);

    setTimeout(() => {
      setShowSaveToast(false);
    }, 1800);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const displayInitial = user.name ? user.name.charAt(0) : 'U';

  return (
    <div
      className="relative min-h-screen"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.18) 0%, rgba(95,117,177,0.06) 24%, transparent 48%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <header className="flex h-16 items-center sm:h-[72px] md:h-20">
          <div className="flex w-[56px] items-center justify-start">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white"
              aria-label="뒤로가기"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 text-center">
            <span className="text-[16px] font-medium tracking-[0.18em] text-slate-700 sm:text-[18px] md:text-[20px] lg:text-[24px]">
              CLAIR.
            </span>
          </div>

          <div className="flex w-[56px] items-center justify-end">
            <button
              onClick={() => (isEdit ? handleSave() : setIsEdit(true))}
              className="text-[13px] font-semibold text-[#6C80DD] hover:opacity-80 sm:text-[14px]"
            >
              {isEdit ? '저장' : '편집'}
            </button>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-[560px] md:max-w-[620px] lg:max-w-[680px]">
            <section className="rounded-[20px] border border-white/90 bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#667AF2] to-[#8097F8] text-white shadow-sm"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="프로필 이미지"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[18px] font-semibold">
                        {displayInitial}
                      </span>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/35 opacity-0 transition group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#EEF2FF] text-[#4C63D2] shadow-sm"
                    aria-label="프로필 사진 변경"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-[15px] font-semibold text-slate-900">
                    {user.name}
                  </h1>
                  <p className="truncate text-[12px] text-slate-500">
                    {user.email}
                  </p>

                  {isEdit && (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-full bg-[#EEF2F9] px-2.5 py-1 text-[10px] font-medium text-[#6C80DD]"
                      >
                        사진 변경
                      </button>

                      {profileImage && (
                        <button
                          type="button"
                          onClick={handleResetImage}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500"
                        >
                          기본 이미지
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-4 overflow-hidden rounded-[20px] border border-white/90 bg-white/90 shadow-sm backdrop-blur">
              <div className="space-y-4 p-4">
                <div>
                  <label className="text-[12px] text-slate-400">닉네임</label>
                  <input
                    disabled={!isEdit}
                    value={user.name}
                    onChange={(e) =>
                      setUser({ ...user, name: e.target.value })
                    }
                    className={`w-full rounded-xl border px-3 py-2.5 text-[14px] ${
                      isEdit
                        ? 'border-[#D8E0F5] bg-white'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="text-[12px] text-slate-400">이메일</label>
                  <input
                    disabled
                    value={user.email}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[14px]"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    이메일은 변경할 수 없어요.
                  </p>
                </div>

                <div>
                  <label className="text-[12px] text-slate-400">비밀번호</label>
                  <div className="flex gap-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      disabled={!isEdit}
                      value={user.password}
                      placeholder="새 비밀번호 입력"
                      onChange={(e) =>
                        setUser({ ...user, password: e.target.value })
                      }
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    비밀번호를 입력한 경우에만 변경됩니다.
                  </p>
                </div>
              </div>

              {isEdit && (
                <div className="flex gap-2 border-t border-slate-100 p-4">
                  <button
                    type="button"
                    onClick={() => setIsEdit(false)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-600"
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    style={{
                      backgroundColor: '#EEF2FF',
                      color: '#4C63D2',
                    }}
                    className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold shadow-sm transition"
                  >
                    저장
                  </button>
                </div>
              )}
            </section>

            <section className="mt-4 rounded-[20px] border border-white/90 bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF]">
                  <Shield className="h-5 w-5 text-[#6C80DD]" />
                </div>

                <div>
                  <h2 className="text-[15px] font-semibold text-slate-900">
                    계정 정보
                  </h2>
                  <p className="text-[12px] text-slate-500">
                    계정의 기본 정보를 확인해보세요.
                  </p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span className="flex-1 text-[13px] font-medium text-slate-800">
                    이메일 인증
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                    인증 완료
                  </span>
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="flex-1 text-[13px] font-medium text-slate-800">
                    계정 상태
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                    활성
                  </span>
                </div>

                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="flex-1 text-[13px] font-medium text-slate-800">
                    가입일
                  </span>
                  <span className="text-[12px] text-slate-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : '정보 없음'}
                  </span>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[20px] border border-white/90 bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF2FF]">
                  <KeyRound className="h-5 w-5 text-[#6C80DD]" />
                </div>

                <div>
                  <h2 className="text-[15px] font-semibold text-slate-900">
                    보안 관리
                  </h2>
                  <p className="text-[12px] text-slate-500">
                    계정 보안을 관리할 수 있어요.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setIsEdit(true)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-left transition hover:bg-[#F8FAFF] sm:gap-5 sm:px-6 sm:py-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFF]">
                    <KeyRound className="h-4 w-4 text-slate-600" />
                  </div>

                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-slate-900">
                      비밀번호 변경
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-slate-400">
                      주기적인 비밀번호 변경으로 계정을 보호하세요.
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-left transition hover:bg-[#F8FAFF] sm:gap-5 sm:px-6 sm:py-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFF]">
                    <LogOut className="h-4 w-4 text-slate-600" />
                  </div>

                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-slate-900">
                      로그아웃
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-slate-400">
                      현재 로그인된 계정에서 로그아웃됩니다.
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-4 rounded-2xl border border-red-100 bg-white px-5 py-4 text-left transition hover:bg-[#FFF7F7] sm:gap-5 sm:px-6 sm:py-5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF5F5]">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  </div>

                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-slate-900">
                      계정 탈퇴
                    </p>

                    <p className="mt-1 text-[12px] leading-5 text-slate-400">
                      계정을 삭제하면 모든 데이터가 사라지며 복구할 수 없습니다.
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </button>
              </div>
            </section>

            <div className="mt-5 border-t border-slate-200/70 pt-4 text-center">
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                style={{
                  backgroundColor: '#EEF2FF',
                  color: '#4C63D2',
                }}
                className="w-full rounded-2xl px-4 py-3 text-[14px] font-semibold shadow-sm transition hover:opacity-90"
              >
                로그아웃
              </button>

              <p className="mt-2 text-[12px] text-slate-400">
                현재 계정에서 로그아웃됩니다
              </p>
            </div>
          </div>
        </main>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">
                  로그아웃 하시겠어요?
                </h2>
                <p className="mt-2 text-[13px] text-slate-500">
                  현재 계정에서 로그아웃됩니다.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-700"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  backgroundColor: '#EEF2FF',
                  color: '#4C63D2',
                }}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold shadow-sm transition hover:opacity-90"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4">
          <div className="rounded-full border border-white/80 bg-slate-900/85 px-5 py-3 text-[13px] font-medium text-white shadow-lg backdrop-blur sm:text-[14px]">
            프로필 정보가 저장되었습니다
          </div>
        </div>
      )}
    </div>
  );
}