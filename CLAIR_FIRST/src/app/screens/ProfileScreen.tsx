import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, X } from 'lucide-react';
import client from '../../api/client';

export default function ProfileScreen() {
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const [user, setUser] = useState({
    name: '지연 이',
    email: 'user@clair.app',
    password: 'password123',
  });

  const handleSave = () => {
    setIsEdit(false);
    setShowSaveToast(true);

    setTimeout(() => {
      setShowSaveToast(false);
    }, 1800);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    navigate('/login');
  };

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
          <div className="w-full max-w-[520px]">
            <section className="rounded-[20px] border border-white/90 bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#667AF2] to-[#8097F8] text-white">
                  지
                </div>

                <div>
                  <h1 className="text-[15px] font-semibold text-slate-900">
                    {user.name}
                  </h1>
                  <p className="text-[12px] text-slate-500">{user.email}</p>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[20px] border border-white/90 bg-white/90 p-4 shadow-sm backdrop-blur">
              <div className="space-y-4">
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
                </div>

                <div>
                  <label className="text-[12px] text-slate-400">비밀번호</label>
                  <div className="flex gap-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      disabled={!isEdit}
                      value={user.password}
                      onChange={(e) =>
                        setUser({ ...user, password: e.target.value })
                      }
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-[14px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-10 w-10 rounded-xl border border-slate-200 bg-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
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