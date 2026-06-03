import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../../api/client';

type RiskItem = {
  title?: string;
  category?: string;
  description?: string;
  reason?: string;
  content?: string;
  clause?: string;
  clause_title?: string;
  risk_level?: string;
  risk_type?: string;
  explanation?: string;
  clause_number?: string | number | null;
};

const pageFontFamily =
  'Pretendard, Inter, "Noto Sans KR", -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

export default function SharePage() {
  const { token } = useParams();

  const [data, setData] = useState<any>(null);
  const [contractResult, setContractResult] = useState<any>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingResult, setIsFetchingResult] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('share_access_token')) {
        localStorage.removeItem(key);
      }
    });

    setPassword('');
    setAccessToken(null);
    setIsVerified(false);
    setData(null);
    setContractResult(null);
    setErrorMessage('');
  }, [token]);

  const verifyPassword = async () => {
    if (!token) {
      setErrorMessage('공유 토큰을 찾을 수 없습니다.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await client.post(`/api/v1/shares/${token}/verify`, {
        password: password.trim(),
      });

      const issuedAccessToken =
        response.data?.access_token ?? response.data?.accessToken;

      if (!issuedAccessToken) {
        setErrorMessage('공유 접근 토큰을 받을 수 없습니다.');
        return;
      }

      setAccessToken(issuedAccessToken);
      setIsVerified(true);
      setPassword('');
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 401) {
        setErrorMessage('비밀번호가 올바르지 않습니다.');
      } else if (status === 404) {
        setErrorMessage(
          '공유 링크를 찾을 수 없습니다. 새로 생성한 공유 링크인지 확인해주세요.'
        );
      } else {
        setErrorMessage('비밀번호 확인 중 문제가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContractResultScore = async (contractId?: number | string) => {
    if (!contractId) return;

    try {
      const response = await client.get(`/api/v1/contracts/${contractId}`);
      setContractResult(response.data);
    } catch {
      setContractResult(null);
    }
  };

  const fetchSharedResult = async () => {
    if (!token || !accessToken) return;

    try {
      setIsFetchingResult(true);
      setErrorMessage('');

      const response = await client.get(`/api/v1/shares/${token}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setData(response.data);
      await fetchContractResultScore(response.data?.contract_id);
    } catch (error: any) {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        setAccessToken(null);
        setIsVerified(false);
        setPassword('');
        setErrorMessage(
          '공유 링크 접근 권한이 만료되었습니다. 비밀번호를 다시 입력해주세요.'
        );
      } else if (status === 404) {
        setErrorMessage('공유된 계약서를 찾을 수 없습니다.');
      } else {
        setErrorMessage('공유 결과를 불러오는 중 문제가 발생했습니다.');
      }
    } finally {
      setIsFetchingResult(false);
    }
  };

  useEffect(() => {
    if (isVerified && accessToken) {
      fetchSharedResult();
    }
  }, [isVerified, accessToken]);

  const fileName = useMemo(() => {
    return (
      data?.original_filename ??
      data?.file_name ??
      data?.filename ??
      contractResult?.original_filename ??
      contractResult?.file_name ??
      contractResult?.filename ??
      data?.contract?.original_filename ??
      data?.contract?.file_name ??
      data?.contract?.filename ??
      '공유된 계약서.pdf'
    );
  }, [data, contractResult]);

  const summary = useMemo(() => {
    return (
      data?.summary ??
      data?.analysis?.summary ??
      data?.result?.summary ??
      data?.analysis_result?.summary ??
      data?.analysis_result?.result?.summary ??
      contractResult?.summary ??
      contractResult?.analysis?.summary ??
      contractResult?.analysis_result?.summary ??
      data?.contract?.summary ??
      data?.contract?.analysis?.summary ??
      data?.contract?.analysis_result?.summary ??
      '요약 정보가 없습니다.'
    );
  }, [data, contractResult]);

  const risks: RiskItem[] = useMemo(() => {
    const candidates = [
      data?.risk_clauses,
      data?.riskClauses,
      data?.risks,
      data?.risk_factors,
      data?.riskFactors,
      data?.risk_items,
      data?.riskItems,

      contractResult?.risk_clauses,
      contractResult?.riskClauses,
      contractResult?.risks,
      contractResult?.risk_factors,
      contractResult?.riskFactors,
      contractResult?.risk_items,
      contractResult?.riskItems,

      data?.analysis?.risk_clauses,
      data?.analysis?.riskClauses,
      data?.analysis?.risks,
      data?.analysis?.risk_factors,
      data?.analysis?.riskFactors,
      data?.analysis?.risk_items,
      data?.analysis?.riskItems,

      data?.contract?.risk_clauses,
      data?.contract?.riskClauses,
      data?.contract?.risks,
      data?.contract?.risk_factors,
      data?.contract?.riskFactors,
      data?.contract?.risk_items,
      data?.contract?.riskItems,
    ];

    const found = candidates.find((item) => Array.isArray(item));

    return Array.isArray(found) ? found : [];
  }, [data, contractResult]);

  const score = useMemo(() => {
    const candidates = [
      contractResult?.safety_score,
      contractResult?.score,
      contractResult?.safetyScore,
      contractResult?.analysis?.safety_score,
      contractResult?.analysis?.score,
      contractResult?.analysis_result?.safety_score,
      contractResult?.analysis_result?.score,

      data?.safety_score,
      data?.score,
      data?.safetyScore,
      data?.analysis?.safety_score,
      data?.analysis?.score,
      data?.result?.safety_score,
      data?.result?.score,
      data?.analysis_result?.safety_score,
      data?.analysis_result?.score,
    ];

    const found = candidates.find(
      (value) => value !== undefined && value !== null && value !== ''
    );

    if (found !== undefined && found !== null && found !== '') {
      return Number(found);
    }

    if (risks.length > 0) {
      const highCount = risks.filter(
        (risk) => risk?.risk_level?.toLowerCase() === 'high'
      ).length;

      const mediumCount = risks.filter(
        (risk) => risk?.risk_level?.toLowerCase() === 'medium'
      ).length;

      const lowCount = risks.filter(
        (risk) => risk?.risk_level?.toLowerCase() === 'low'
      ).length;

      return Math.max(
        0,
        Math.min(100, 100 - highCount * 15 - mediumCount * 8 - lowCount * 2)
      );
    }

    return null;
  }, [data, contractResult, risks]);

  const riskCounts = useMemo(() => {
    return risks.reduce(
      (acc, risk) => {
        const level = risk?.risk_level?.toLowerCase();

        if (level === 'high') acc.high += 1;
        else if (level === 'medium') acc.medium += 1;
        else if (level === 'low') acc.low += 1;

        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );
  }, [risks]);

  const aiComment = useMemo(() => {
    if (score === null) {
      return '아직 계약 안정도 점수를 계산할 수 없습니다. 분석 결과를 다시 확인해주세요.';
    }

    if (score >= 70) {
      return '전반적으로 안정적인 계약서입니다. 다만 세부 조항은 체결 전 한 번 더 확인하는 것이 좋습니다.';
    }

    if (score >= 40) {
      return '주의가 필요한 조항이 포함되어 있습니다. 특히 보통 이상 위험 요소를 중심으로 검토가 필요합니다.';
    }

    return '근로자에게 불리하게 작용할 수 있는 조항이 다수 포함되어 있습니다. 계약 전 수정 요청이나 전문가 검토를 권장합니다.';
  }, [score]);

  const getRiskTypeLabel = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'termination':
        return '해고/퇴직';
      case 'confidentiality':
        return '비밀유지';
      case 'liability':
        return '손해배상';
      case 'etc':
        return '기타';
      default:
        return type ?? '위험 조항';
    }
  };

  const getRiskLevelStyle = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return {
          card: 'bg-[#FFF1F1] border-[#FFD6D6]',
          badge: 'bg-[#FF4D3D] text-white',
          icon: 'bg-[#FF4D3D] text-white',
          text: 'text-[#FF4D3D]',
        };
      case 'medium':
        return {
          card: 'bg-[#FFF9E8] border-[#FFE9A8]',
          badge: 'bg-[#F5A623] text-white',
          icon: 'bg-[#F5A623] text-white',
          text: 'text-[#F5A623]',
        };
      case 'low':
        return {
          card: 'bg-[#ECFFF7] border-[#BFEFD8]',
          badge: 'bg-[#18B982] text-white',
          icon: 'bg-[#18B982] text-white',
          text: 'text-[#18B982]',
        };
      default:
        return {
          card: 'bg-[#FAFBFE] border-[#E4E9F5]',
          badge: 'bg-[#EEF2F9] text-[#5F75B1]',
          icon: 'bg-[#5F75B1] text-white',
          text: 'text-[#5F75B1]',
        };
    }
  };

  const getRiskIcon = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return '△';
      case 'medium':
        return '○';
      case 'low':
        return '✓';
      default:
        return '!';
    }
  };

  const stabilityLabel = useMemo(() => {
    if (score === null) return '분석 대기';
    if (score >= 70) return '안전';
    if (score >= 40) return '주의 필요';
    return '위험';
  }, [score]);

  if (!isVerified) {
    return (
      <div
        className="min-h-screen px-5 py-10"
        style={{
          fontFamily: pageFontFamily,
          background:
            'linear-gradient(180deg, #EEF2F9 0%, #F7F9FC 42%, #FFFFFF 100%)',
        }}
      >
        <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[680px] items-center justify-center">
          <section
            className="w-full rounded-[28px] border px-7 py-8 sm:px-9 sm:py-10"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E3E8F2',
              boxShadow: '0 16px 44px rgba(95,117,177,0.14)',
            }}
          >
            <div className="mb-8">
              <h1 className="text-[25px] font-bold tracking-[-0.04em] text-[#1F2A44]">
                공유된 계약서 분석 결과
              </h1>

              <p className="mt-2 text-sm font-medium leading-6 text-[#8A94AA]">
                공유 링크를 통해 확인 중인 계약서입니다.
                <br />
                계약서를 확인하려면 공유 비밀번호를 입력해주세요.
              </p>
            </div>

            <label className="mb-2 block text-sm font-semibold text-[#5F6678]">
              공유 비밀번호
            </label>

            <input
              type="password"
              name={`share-password-${token ?? 'temp'}`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  verifyPassword();
                }
              }}
              placeholder="비밀번호를 입력해주세요"
              className="h-[52px] w-full rounded-[16px] border px-4 text-sm font-medium outline-none transition"
              style={{
                borderColor: '#DDE4F2',
                backgroundColor: '#F8FAFD',
                color: '#26324D',
              }}
            />

            {errorMessage && (
              <p className="mt-3 text-sm font-medium text-[#D45B5B]">
                {errorMessage}
              </p>
            )}

            <button
              type="button"
              onClick={verifyPassword}
              disabled={isLoading}
              className="mt-6 flex h-[52px] w-full items-center justify-center rounded-[16px] text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background:
                  'linear-gradient(135deg, #627EEA 0%, #7B8EF3 100%)',
                color: '#FFFFFF',
                boxShadow: '0 10px 24px rgba(98,126,234,0.28)',
              }}
            >
              {isLoading ? '확인 중...' : '계약서 확인하기'}
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-10"
      style={{
        fontFamily: pageFontFamily,
        background:
          'linear-gradient(180deg, #EEF2F9 0%, #F8FAFD 42%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-[1280px] flex-col justify-center">
        <header className="mb-8 flex items-center">
          <div className="flex-1 text-center">
            <span className="pointer-events-none text-[18px] font-medium tracking-[0.18em] text-slate-700 sm:text-[22px] lg:text-[24px]">
              CLAIR.
            </span>
          </div>
        </header>

        <section
          className="w-full rounded-[36px] border px-6 py-8 sm:px-9 sm:py-10 lg:px-11"
          style={{
            backgroundColor: 'rgba(255,255,255,0.96)',
            borderColor: '#E5EAF4',
            boxShadow: '0 26px 80px rgba(95,117,177,0.16)',
          }}
        >
          <div className="mb-8 text-center">
            <p className="text-[11px] font-extrabold tracking-[0.42em] text-[#8D99B1]">
              SHARED ANALYSIS
            </p>

            <h2 className="mt-4 text-[26px] font-extrabold tracking-[-0.06em] text-[#1F2A44] sm:text-[32px]">
              공유된 계약서 분석 결과
            </h2>

            <p className="mt-3 text-sm font-medium leading-6 text-[#8A94AA]">
              공유 링크를 통해 확인 중인 계약서입니다.
            </p>
          </div>

          {isFetchingResult ? (
            <div className="rounded-[26px] bg-[#F7F8FC] px-5 py-16 text-center text-sm font-semibold text-[#8A94AA]">
              공유 결과를 불러오는 중입니다...
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-5 rounded-[18px] bg-[#FFF4F4] px-5 py-4 text-sm font-medium text-[#D45B5B]">
                  {errorMessage}
                </div>
              )}

              <div className="mb-6 rounded-[24px] border border-[#E4E9F5] bg-[#F8FAFD] px-5 py-4">
                <p className="text-[11px] font-extrabold tracking-[0.32em] text-[#8A94AA]">
                  FILE NAME
                </p>
                <p className="mt-2 break-all text-base font-bold text-[#26324D]">
                  {fileName}
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <aside className="flex flex-col gap-5">
                  <section className="rounded-[28px] border border-[#E4E9F5] bg-white px-6 py-7 shadow-[0_14px_34px_rgba(95,117,177,0.08)]">
                    <div className="flex items-center gap-6">
                      <div className="shrink-0">
                        {(() => {
                          const s = Math.max(0, Math.min(100, score ?? 0));
                          const size = 128;
                          const sw = 14;
                          const center = size / 2;
                          const radius = (size - sw) / 2;
                          const circumference = 2 * Math.PI * radius;
                          const dashOffset = circumference * (1 - s / 100);
                          return (
                            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`계약 안정도 ${s}점`}>
                              <circle cx={center} cy={center} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={sw} />
                              <circle cx={center} cy={center} r={radius} fill="none" stroke="#6C80DD" strokeWidth={sw}
                                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                                strokeLinecap="butt" transform={`rotate(-90 ${center} ${center})`} />
                              <text x={center} y={center} textAnchor="middle" dominantBaseline="middle"
                                fill="#0F172A" fontSize="30" fontWeight="600" letterSpacing="-0.04em" dy="-8">
                                {score ?? '-'}
                              </text>
                              <text x={center} y={center} textAnchor="middle" dominantBaseline="middle"
                                fill="#64748B" fontSize="12" fontWeight="500" dy="20">
                                점
                              </text>
                            </svg>
                          );
                        })()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-[24px] font-extrabold tracking-[-0.06em] text-[#26324D]">
                          계약 안정도
                        </h3>

                        <p className="mt-2 text-sm font-semibold text-[#7C879E]">
                          {stabilityLabel}
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 text-xs font-medium leading-5 text-[#9AA4B8]">
                      안정도 점수는 분석 결과와 위험 요소 수를 기준으로 표시됩니다.
                    </p>
                  </section>

                  <section className="rounded-[28px] border border-[#E4E9F5] bg-white px-6 py-6 shadow-[0_14px_34px_rgba(95,117,177,0.08)]">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-base font-extrabold tracking-[-0.04em] text-[#26324D]">
                        위험 통계
                      </h3>

                      <span className="rounded-full bg-[#EEF2F9] px-3 py-1 text-xs font-bold text-[#5F75B1]">
                        총 {risks.length}개
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-[18px] border border-[#FFD6D6] bg-[#FFF7F7] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4D3D] text-xs font-bold text-white">
                            △
                          </span>
                          <span className="text-sm font-bold text-[#26324D]">
                            높음
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-[#FF4D3D]">
                          {riskCounts.high}개
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-[18px] border border-[#FFE9A8] bg-[#FFF9E8] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5A623] text-xs font-bold text-white">
                            ○
                          </span>
                          <span className="text-sm font-bold text-[#26324D]">
                            보통
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-[#F5A623]">
                          {riskCounts.medium}개
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-[18px] border border-[#BFEFD8] bg-[#ECFFF7] px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#18B982] text-xs font-bold text-white">
                            ✓
                          </span>
                          <span className="text-sm font-bold text-[#26324D]">
                            낮음
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-[#18B982]">
                          {riskCounts.low}개
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-[#E4E9F5] bg-[#F8FAFD] px-6 py-6 shadow-[0_14px_34px_rgba(95,117,177,0.06)]">
                    <p className="text-[11px] font-extrabold tracking-[0.28em] text-[#8D99B1]">
                      AI COMMENT
                    </p>

                    <h3 className="mt-3 text-base font-extrabold tracking-[-0.04em] text-[#26324D]">
                      CLAIR 분석 코멘트
                    </h3>

                    <p className="mt-3 text-sm font-medium leading-6 text-[#6E7890]">
                      {aiComment}
                    </p>
                  </section>
                </aside>

                <main className="space-y-6">
                  <section className="rounded-[32px] border border-[#E4E9F5] bg-white px-5 py-5 shadow-[0_14px_34px_rgba(95,117,177,0.08)] sm:px-6 sm:py-6">
                    <h3 className="text-base font-extrabold tracking-[-0.04em] text-[#26324D]">
                      계약서 요약
                    </h3>

                    <div className="mt-4 rounded-[22px] bg-[#F7F8FC] px-5 py-5 text-sm font-medium leading-7 text-[#4B5568]">
                      {summary}
                    </div>
                  </section>

                  <section className="rounded-[32px] border border-[#E4E9F5] bg-white px-5 py-5 shadow-[0_14px_34px_rgba(95,117,177,0.08)] sm:px-6 sm:py-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="text-base font-extrabold tracking-[-0.04em] text-[#26324D]">
                        위험 요소
                      </h3>

                      <span className="rounded-full bg-[#EEF2F9] px-3 py-1 text-xs font-bold text-[#5F75B1]">
                        {risks.length}개
                      </span>
                    </div>

                    {risks.length > 0 ? (
                      <div className="space-y-3">
                        {risks.map((risk, index) => {
                          const levelStyle = getRiskLevelStyle(
                            risk?.risk_level
                          );

                          return (
                            <div
                              key={index}
                              className={`rounded-[22px] border px-5 py-4 ${levelStyle.card}`}
                            >
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold ${levelStyle.icon}`}
                                >
                                  {getRiskIcon(risk?.risk_level)}
                                </span>

                                <p className="text-sm font-extrabold text-[#26324D]">
                                  {getRiskTypeLabel(
                                    risk?.title ??
                                      risk?.risk_type ??
                                      risk?.category ??
                                      risk?.clause_title ??
                                      risk?.clause
                                  )}
                                </p>

                                {risk?.risk_level && (
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${levelStyle.badge}`}
                                  >
                                    {risk.risk_level}
                                  </span>
                                )}
                              </div>

                              <p className="text-sm font-medium leading-6 text-[#5F6678]">
                                {risk?.explanation ??
                                  risk?.description ??
                                  risk?.reason ??
                                  risk?.content ??
                                  (typeof risk === 'string'
                                    ? risk
                                    : JSON.stringify(risk))}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-[22px] bg-[#F7F8FC] px-5 py-5 text-sm font-medium text-[#8A94AA]">
                        위험 요소 정보가 없습니다.
                      </div>
                    )}
                  </section>
                </main>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}