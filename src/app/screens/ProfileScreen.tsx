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
  const [toastMessage, setToastMessage] = useState('프로필 정보가 저장되었습니다');
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [savedProfileImage, setSavedProfileImage] = useState<string | null>(null);
  const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(null);
  const [profileImageDeleted, setProfileImageDeleted] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const [user, setUser] = useState({
    name: '',
    email: '',
    password: '',
    createdAt: '',
  });

  const [savedUser, setSavedUser] = useState(user);

  const showToast = (message: string) => {
    setToastMessage(message);
    setShowSaveToast(true);
    window.setTimeout(() => {
      setShowSaveToast(false);
    }, 1800);
  };

  const getErrorMessage = (error: any, fallback: string) => {
    return (
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      fallback
    );
  };

  const patchWithFallbackPayloads = async (
    url: string,
    payloads: Array<Record<string, string>>,
  ) => {
    let lastError: unknown;

    for (const payload of payloads) {
      try {
        return await client.patch(url, payload);
      } catch (error: any) {
        lastError = error;

        if (![400, 422].includes(error?.response?.status)) {
          throw error;
        }
      }
    }

    throw lastError;
  };

  useEffect(() => {
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
      setSavedProfileImage(savedImage);
    }

    const fetchUserInfo = async () => {
      try {
        const res = await client.get('/api/v1/auth/me');

        setUser({
          name: res.data.nickname || res.data.name || '사용자',
          email: res.data.email || '',
          password: '',
          createdAt: res.data.created_at || res.data.createdAt || '',
        });
        setSavedUser({
          name: res.data.nickname || res.data.name || '사용자',
          email: res.data.email || '',
          password: '',
          createdAt: res.data.created_at || res.data.createdAt || '',
        });

        const serverImage = res.data.profile_image || res.data.profileImage;
        if (serverImage) {
          setProfileImage(serverImage);
          setSavedProfileImage(serverImage);
          localStorage.setItem('profileImage', serverImage);
        }
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
        const stored = localStorage.getItem('userInfo');
        if (stored) {
          const u = JSON.parse(stored);
          setUser({
            name: u.nickname || u.name || '사용자',
            email: u.email || '',
            password: '',
            createdAt: u.created_at || u.createdAt || '',
          });
          setSavedUser({
            name: u.nickname || u.name || '사용자',
            email: u.email || '',
            password: '',
            createdAt: u.created_at || u.createdAt || '',
          });
        }
      }
    };

    fetchUserInfo();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedProfileFile(file);
    setProfileImageDeleted(false);

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = () => {
    setProfileImage(null);
    setSelectedProfileFile(null);
    setProfileImageDeleted(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const syncStoredUserInfo = (nextNickname: string) => {
    const stored = localStorage.getItem('userInfo');
    const userInfo = stored ? JSON.parse(stored) : {};

    userInfo.nickname = nextNickname;
    userInfo.name = nextNickname;
    userInfo.email = user.email || userInfo.email;

    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  };

  const uploadProfileImage = async (file: File) => {
    const formData = new FormData();

    formData.append('file', file);

    return client.post('/api/v1/auth/me/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      const nextName = user.name.trim();

      if (!nextName) {
        showToast('닉네임을 입력해주세요.');
        return;
      }

      if (nextName !== savedUser.name) {
        await patchWithFallbackPayloads('/api/v1/auth/me/nickname', [
          { nickname: nextName },
          { name: nextName },
        ]);
      }

      if (currentPassword.trim() || user.password.trim()) {
        if (!currentPassword.trim() || !user.password.trim()) {
          showToast('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
          return;
        }

        await client.patch('/api/v1/auth/me/password', {
          current_password: currentPassword.trim(),
          new_password: user.password.trim(),
        });
      }

      if (selectedProfileFile) {
        const response = await uploadProfileImage(selectedProfileFile);
        const serverImage =
          response.data?.profile_image ||
          response.data?.profileImage ||
          response.data?.url ||
          response.data?.image_url;

        if (serverImage) {
          setProfileImage(serverImage);
          setSavedProfileImage(serverImage);
          localStorage.setItem('profileImage', serverImage);
        } else if (profileImage) {
          localStorage.setItem('profileImage', profileImage);
          setSavedProfileImage(profileImage);
        }
      } else if (profileImageDeleted) {
        await client.delete('/api/v1/auth/me/profile-image');
        setSavedProfileImage(null);
        localStorage.removeItem('profileImage');
      } else if (profileImage) {
        localStorage.setItem('profileImage', profileImage);
        setSavedProfileImage(profileImage);
      }

      const nextUser = {
        ...user,
        name: nextName,
        password: '',
      };

      setUser(nextUser);
      setSavedUser(nextUser);
      setCurrentPassword('');
      syncStoredUserInfo(nextName);
      setSelectedProfileFile(null);
      setProfileImageDeleted(false);
      setIsEdit(false);
      showToast('프로필 정보가 저장되었습니다');
    } catch (error: any) {
      console.error('프로필 저장 실패:', error);
      showToast(getErrorMessage(error, '프로필 저장에 실패했습니다.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setUser(savedUser);
    setCurrentPassword('');
    setProfileImage(savedProfileImage);
    setSelectedProfileFile(null);
    setProfileImageDeleted(false);
    setIsEdit(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleAccountDeleteClick = () => {
    showToast('회원 탈퇴 API가 아직 제공되지 않았습니다.');
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
              disabled={isSaving}
              className="text-[13px] font-semibold text-[#6C80DD] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:text-[14px]"
            >
              {isSaving ? '저장 중' : isEdit ? '저장' : '편집'}
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
                    onClick={() => isEdit && fileInputRef.current?.click()}
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
                    onClick={() => isEdit && fileInputRef.current?.click()}
                    disabled={!isEdit}
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
                    disabled={!isEdit}
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
                  <label className="text-[12px] text-slate-400">현재 비밀번호</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    disabled={!isEdit}
                    value={currentPassword}
                    placeholder="현재 비밀번호 입력"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-[14px] disabled:bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-[12px] text-slate-400">새 비밀번호</label>
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
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    현재 비밀번호와 새 비밀번호를 모두 입력한 경우에만 변경됩니다.
                  </p>
                </div>
              </div>

              {isEdit && (
                <div className="flex gap-2 border-t border-slate-100 p-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-600"
                  >
                    취소
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{
                      backgroundColor: '#EEF2FF',
                      color: '#4C63D2',
                    }}
                    className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold shadow-sm transition"
                  >
                    {isSaving ? '저장 중...' : '저장'}
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
                  onClick={handleAccountDeleteClick}
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
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
