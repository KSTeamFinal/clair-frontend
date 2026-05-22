import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
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
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState('');
  const [contracts, setContracts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAllContracts, setShowAllContracts] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await client.get('/api/v1/notifications/unread-count');

      setUnreadCount(res.data.unread_count || 0);
    } catch (error) {
      console.error('읽지 않은 알림 수 조회 실패:', error);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. 내 정보 가져오기 (실패해도 계약서 목록 조회는 계속)
      try {
        const userRes = await client.get('/api/v1/auth/me');
        const userData = userRes.data;
        if (userData) {
          setNickname(userData.nickname || userData.user?.email || '사용자');
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error);
      }

      // 2. 계약서 목록 가져오기
      const contractRes = await client.get('/api/v1/contracts/');
      const contractData = contractRes.data;

      let parsedContracts: any[] = [];

      if (Array.isArray(contractData)) {
        parsedContracts = contractData;
      } else if (Array.isArray(contractData?.results)) {
        parsedContracts = contractData.results;
      } else if (Array.isArray(contractData?.contracts)) {
        parsedContracts = contractData.contracts;
      }

      parsedContracts.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );

      setContracts(parsedContracts);
    } catch (error: any) {
      console.error('계약서 목록 로드 실패:', error);
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchUnreadCount();
  }, [fetchData, location.pathname]);

  const normalizeRiskLevel = (value: unknown) => {
    const level = String(value ?? '').toLowerCase();

    if (
      level.includes('high') ||
      level.includes('높') ||
      level.includes('위험') ||
      level.includes('danger')
    ) {
      return 'high';
    }

    if (
      level.includes('medium') ||
      level.includes('보통') ||
      level.includes('중') ||
      level.includes('주의')
    ) {
      return 'medium';
    }

    return 'low';
  };

  const getContractSafetyScore = (contract: any) => {
    const apiScore =
      contract.safety_score ??
      contract.analysis?.safety_score ??
      contract.analysis_result?.safety_score ??
      contract.result?.safety_score;

    if (apiScore !== undefined && apiScore !== null) {
      return Number(apiScore);
    }

    const risks = Array.isArray(contract?.risk_clauses)
      ? contract.risk_clauses
      : [];

    const highCount = risks.filter(
      (risk: any) => normalizeRiskLevel(risk?.risk_level) === 'high'
    ).length;

    const mediumCount = risks.filter(
      (risk: any) => normalizeRiskLevel(risk?.risk_level) === 'medium'
    ).length;

    const lowCount = risks.filter(
      (risk: any) => normalizeRiskLevel(risk?.risk_level) === 'low'
    ).length;

    return Math.max(
      0,
      Math.min(100, 100 - highCount * 15 - mediumCount * 8 - lowCount * 2)
    );
  };

  const visibleContracts = showAllContracts
    ? contracts
    : contracts.slice(0, 3);

  const completedContracts = contracts.filter(
    (contract) => contract.status === 'COMPLETED'
  );

  const averageSafetyScore =
    completedContracts.length > 0
      ? Math.round(
          completedContracts.reduce(
            (acc, contract) => acc + getContractSafetyScore(contract),
            0
          ) / completedContracts.length
        )
      : 0;

  // 계약서 1건당 직접 검토 시간 약 2시간 절약 기준
  const savedHours = completedContracts.length * 2;

  // 상단 통계 수치
  const stats = [
    {
      id: 1,
      label: '총 분석 건수',
      value: contracts.length.toString(),
      description: '업로드된 전체 문서',
      descriptionClass: 'text-emerald-600',
      icon: <FileText size={20} className="text-[#6C80DD]" />,
      iconBg: 'bg-[#EEF2F9]',
    },
    {
      id: 2,
      label: '계약 안정도',
      value: `${averageSafetyScore}%`,
      description: '최근 분석 문서 평균',
      descriptionClass: 'text-slate-500',
      icon: <ShieldCheck size={20} className="text-sky-600" />,
      iconBg: 'bg-sky-50',
    },
    {
      id: 3,
      label: 'AI로 절약한 시간',
      value: `${savedHours}시간`,
      description: '직접 검토 대비',
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
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur sm:h-11 sm:w-11"
            >
              <Bell size={18} />

              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              )}
            </button>
          </div>

          <div className="flex-1 text-center">
            <span className="pointer-events-none text-[16px] font-medium tracking-[0.18em] text-slate-700 sm:text-[18px] md:text-[20px] lg:text-[24px]">
              CLAIR.
            </span>
          </div>

          <div className="flex w-[48px] items-center justify-end sm:w-[56px]">
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur sm:h-11 sm:w-11"
            >
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
                    안녕하세요, {nickname && <span className="text-[#667AF2]">{nickname}님</span>}
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
                      <span>계약서 업로드</span>
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>

                <div className="hidden lg:grid gap-4">
                  {stats.map((stat) => (
                    <div key={stat.id} className="rounded-[20px] bg-white/90 p-5 shadow-sm">
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

            {/* 하단 계약서 목록 섹션 */}
            <section className="mt-6">
              <div className="rounded-[22px] bg-white/92 p-5 shadow-sm sm:rounded-[24px] sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                    최근 문서
                  </h2>

                  {contracts.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllContracts((prev) => !prev)}
                      className="text-sm font-medium text-[#667AF2] transition hover:opacity-80"
                    >
                      {showAllContracts ? '접기' : '전체보기'}
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {contracts.length > 0 ? (
                    visibleContracts.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => navigate(`/result/${doc.id}`)}
                        className="cursor-pointer rounded-[16px] bg-[#F8FAFF] p-4 transition hover:bg-[#F2F6FF] sm:p-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                              {doc.title ||
                                doc.original_filename ||
                                doc.file_name ||
                                '제목 없는 문서'}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                              {doc.created_at
                                ? new Date(doc.created_at).toLocaleDateString()
                                : '날짜 정보 없음'}
                            </p>

                            <div className="mt-3 flex items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  doc.status === 'COMPLETED'
                                    ? 'bg-emerald-50 text-emerald-600'
                                    : 'bg-blue-50 text-blue-600'
                                }`}
                              >
                                {doc.status === 'COMPLETED'
                                  ? '분석 완료'
                                  : '분석 중'}
                              </span>
                            </div>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#667AF2] to-[#8097F8]">
                            <FileText size={18} className="text-white" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-400">
                      {isLoading
                        ? '최근 문서를 불러오는 중입니다.'
                        : '최근 분석한 문서가 없습니다.'}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}