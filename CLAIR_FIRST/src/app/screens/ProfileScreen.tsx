import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';

export default function ProfileScreen() {
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState({
    name: '지연 이',
    email: 'user@clair.app',
    password: 'password123',
  });

  const handleSave = () => {
    setIsEdit(false);
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
          <div className="flex w-[56px] items-center justify-start">
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

          <div className="flex w-[56px] items-center justify-end">
            <button
              type="button"
              onClick={() => (isEdit ? handleSave() : setIsEdit(true))}
              className="text-[13px] font-semibold text-[#6C80DD] transition hover:opacity-80 sm:text-[14px]"
            >
              {isEdit ? '저장' : '편집'}
            </button>
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-64px)] flex-1 items-center justify-center py-4 sm:min-h-[calc(100vh-72px)] sm:py-5 md:min-h-[calc(100vh-80px)] md:py-6">
          <div className="w-full max-w-[520px]">
            <section className="rounded-[18px] border border-white/90 bg-white/92 p-4 shadow-sm sm:rounded-[20px] sm:p-4.5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#667AF2] to-[#8097F8] text-white shadow-sm">
                  <span className="text-sm font-semibold">지</span>
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-[15px] font-semibold text-slate-900 sm:text-[16px]">
                    {user.name}
                  </h1>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-[12px]">
                    {user.email}
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-4 rounded-[18px] border border-white/90 bg-white/92 p-4 shadow-sm sm:rounded-[20px] sm:p-4.5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400 sm:text-[12px]">
                    닉네임
                  </label>
                  <input
                    disabled={!isEdit}
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition sm:text-[14px] ${
                      isEdit
                        ? 'border-[#D8E0F5] bg-white text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400 sm:text-[12px]">
                    이메일
                  </label>
                  <input
                    disabled={!isEdit}
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className={`w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition sm:text-[14px] ${
                      isEdit
                        ? 'border-[#D8E0F5] bg-white text-slate-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-400 sm:text-[12px]">
                    비밀번호
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      disabled={!isEdit}
                      value={user.password}
                      onChange={(e) =>
                        setUser({ ...user, password: e.target.value })
                      }
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-[13px] outline-none transition sm:text-[14px] ${
                        isEdit
                          ? 'border-[#D8E0F5] bg-white text-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}