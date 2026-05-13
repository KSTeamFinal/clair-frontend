import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import {
  ArrowLeft,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Bot,
  Send,
  User as UserIcon,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

type MessageType = 'text' | 'score' | 'summary' | 'risks';
type Role = 'bot' | 'user';

type Message = {
  role: Role;
  text: string;
  type: MessageType;
};

type RiskLevel = 'high' | 'medium' | 'low';

type RiskItem = {
  title: string;
  description: string;
  level: RiskLevel;
};

type AnalysisResult = {
  fileName: string;
  analyzedDate: string;
  safetyScore: number;
  contractPeriod: string;
  contractPeriodDetail: string;
  salary: string;
  salaryDetail: string;
  summaryText: string;
  risks: RiskItem[];
};

const DEFAULT_ANALYSIS: AnalysisResult = {
  fileName: '근로계약서.pdf',
  analyzedDate: '분석 완료',
  safetyScore: 0,
  contractPeriod: '-',
  contractPeriodDetail: '-',
  salary: '-',
  salaryDetail: '-',
  summaryText: '분석 결과를 불러오는 중입니다.',
  risks: [],
};

function normalizeRiskLevel(value: unknown): RiskLevel {
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
}

function formatDate(value: unknown) {
  if (!value) return '분석 완료';

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}.${month}.${day} 분석 완료`;
}

function getKeyInfoValue(keyInfo: any, keys: string[], fallback = '-') {
  for (const key of keys) {
    if (keyInfo?.[key] !== undefined && keyInfo?.[key] !== null && keyInfo?.[key] !== '') {
      return String(keyInfo[key]);
    }
  }

  return fallback;
}

function normalizeAnalysis(data: any): AnalysisResult {
  const keyInfo = data?.analysis?.key_info ?? {};

  const risks: RiskItem[] = Array.isArray(data?.risk_clauses)
    ? data.risk_clauses.map((risk: any) => ({
        title:
          risk?.risk_type ??
          risk?.clause_number ??
          risk?.original_text?.slice?.(0, 24) ??
          '확인 필요 조항',
        description:
          risk?.explanation ??
          risk?.evidence_text ??
          risk?.original_text ??
          '해당 조항은 추가 확인이 필요합니다.',
        level: normalizeRiskLevel(risk?.risk_level),
      }))
    : [];

  const highCount = risks.filter((risk) => risk.level === 'high').length;
  const mediumCount = risks.filter((risk) => risk.level === 'medium').length;
  const lowCount = risks.filter((risk) => risk.level === 'low').length;

  const calculatedScore = Math.max(
    0,
    Math.min(100, 100 - highCount * 15 - mediumCount * 8 - lowCount * 2),
  );

  return {
    fileName: data?.original_filename ?? '근로계약서.pdf',
    analyzedDate: formatDate(
      data?.analysis_completed_at ??
        data?.analysis?.created_at ??
        data?.updated_at ??
        data?.created_at,
    ),
    safetyScore: Number(data?.analysis?.safety_score ?? calculatedScore) || 0,
    contractPeriod: getKeyInfoValue(
      keyInfo,
      [
        'contract_period',
        'contractPeriod',
        'period',
        'duration',
        '근로계약기간',
        '계약기간',
      ],
      '-',
    ),
    contractPeriodDetail: getKeyInfoValue(
      keyInfo,
      [
        'contract_period_detail',
        'contractPeriodDetail',
        'period_detail',
        'periodDetail',
        '계약기간상세',
      ],
      '계약서 기준',
    ),
    salary: getKeyInfoValue(
      keyInfo,
      [
        'salary',
        'monthly_salary',
        'monthlySalary',
        'wage',
        'pay',
        '급여',
        '월급',
        '임금',
      ],
      '-',
    ),
    salaryDetail: getKeyInfoValue(
      keyInfo,
      [
        'salary_detail',
        'salaryDetail',
        'wage_detail',
        'wageDetail',
        '급여상세',
        '임금상세',
      ],
      '계약서 기준',
    ),
    summaryText:
      data?.analysis?.summary ??
      data?.summary ??
      '계약서 분석 결과를 확인해보세요.',
    risks,
  };
}

export function ResultDashboard() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const contractId =
    params.contractId ??
    params.id ??
    (location.state as any)?.contractId ??
    (location.state as any)?.id;

  const [analysis, setAnalysis] = useState<AnalysisResult>(DEFAULT_ANALYSIS);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [inputMessage, setInputMessage] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '분석 결과를 불러오고 있어요.', type: 'text' },
  ]);

  const safetyScore = analysis.safetyScore;

  const scoreLabel =
    safetyScore >= 80 ? '안정적' : safetyScore >= 60 ? '확인 필요' : '주의 필요';

  const riskCounts = useMemo(() => {
    return {
      high: analysis.risks.filter((risk) => risk.level === 'high').length,
      medium: analysis.risks.filter((risk) => risk.level === 'medium').length,
      low: analysis.risks.filter((risk) => risk.level === 'low').length,
    };
  }, [analysis.risks]);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);

        if (!contractId) {
          setMessages([
            {
              role: 'bot',
              text: '계약서 ID를 찾을 수 없어 분석 결과를 불러오지 못했어요.',
              type: 'text',
            },
          ]);
          return;
        }

        const response = await client.get(`/api/v1/contracts/${contractId}`);
        const normalized = normalizeAnalysis(response.data);

        setAnalysis(normalized);

        setMessages([
          { role: 'bot', text: '분석이 완료되었어요.', type: 'text' },
          {
            role: 'bot',
            text: normalized.summaryText,
            type: 'text',
          },
          { role: 'bot', text: '', type: 'summary' },
          { role: 'bot', text: '', type: 'risks' },
          { role: 'bot', text: '', type: 'score' },
          {
            role: 'bot',
            text: '계약서에 대해 궁금한 점이 있으면 편하게 물어보세요.',
            type: 'text',
          },
        ]);
      } catch (error) {
        console.error('분석 결과 조회 실패:', error);

        setMessages([
          {
            role: 'bot',
            text: '분석 결과를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
            type: 'text',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [contractId]);

  const suggestedQuestions = [
    '이 계약서의 주요 위험 요소는?',
    '초과 근무 수당은 어떻게 되나요?',
    '계약 해지 조건이 어떻게 되나요?',
  ];

  const handleSendMessage = (preset?: string) => {
    const messageToSend = preset ?? inputMessage;
    if (!messageToSend.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: messageToSend, type: 'text' },
    ]);

    setTimeout(() => {
      let botResponse =
        '계약서와 관련해 궁금한 점을 더 구체적으로 물어보시면 자세히 설명해드릴게요.';

      if (messageToSend.includes('위험') || messageToSend.includes('문제')) {
        botResponse =
          analysis.risks.length > 0
            ? `주요 위험 요소는 ${analysis.risks
                .slice(0, 3)
                .map((risk) => risk.title)
                .join(', ')}입니다. 특히 위험도가 높은 항목부터 확인해보는 것이 좋아요.`
            : '현재 감지된 주요 위험 요소가 없습니다.';
      } else if (messageToSend.includes('급여') || messageToSend.includes('연봉')) {
        botResponse = `급여 정보는 ${analysis.salary}로 확인됩니다. ${analysis.salaryDetail}`;
      } else if (messageToSend.includes('기간') || messageToSend.includes('언제')) {
        botResponse = `계약 기간은 ${analysis.contractPeriod}로 확인됩니다. ${analysis.contractPeriodDetail}`;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: botResponse, type: 'text' },
      ]);
    }, 500);

    setInputMessage('');
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleDownloadPdf = async () => {
    if (!contractId) return;

    try {
      const response = await client.get(`/api/v1/contracts/${contractId}/download/pdf`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `${analysis.fileName.replace(/\.[^/.]+$/, '')}_분석결과.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      alert('PDF 다운로드에 실패했어요.');
    }
  };

  const ScoreRing = ({
    score,
    size = 128,
    strokeWidth = 16,
    numberFontSize = 30,
  }: {
    score: number;
    size?: number;
    strokeWidth?: number;
    numberFontSize?: number;
  }) => {
    const safeScore = Math.max(0, Math.min(100, score));
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - safeScore / 100);

    return (
      <div className="shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          aria-label={`계약 안정도 ${safeScore}점`}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#6C80DD"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
          />

          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#0F172A"
            fontSize={numberFontSize}
            fontWeight="600"
            letterSpacing="-0.04em"
            dy="-8"
          >
            {safeScore}
          </text>

          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#64748B"
            fontSize="12"
            fontWeight="500"
            dy="20"
          >
            점
          </text>
        </svg>
      </div>
    );
  };

  const RiskCards = () => {
    if (analysis.risks.length === 0) {
      return (
        <div className="rounded-[18px] border border-emerald-100 bg-emerald-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CheckCircle size={15} />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-slate-900">
                감지된 위험 요소 없음
              </h4>
              <p className="mt-2 text-[13px] leading-6 text-slate-600">
                현재 분석 결과에서 특별한 위험 요소가 발견되지 않았습니다.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {analysis.risks.map((risk, index) => {
          const isHigh = risk.level === 'high';
          const isMedium = risk.level === 'medium';

          return (
            <div
              key={`${risk.title}-${index}`}
              className={`rounded-[18px] border p-4 ${
                isHigh
                  ? 'border-red-100 bg-red-50'
                  : isMedium
                    ? 'border-amber-100 bg-amber-50'
                    : 'border-emerald-100 bg-emerald-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] text-white ${
                    isHigh
                      ? 'bg-gradient-to-br from-red-500 to-orange-500'
                      : isMedium
                        ? 'bg-gradient-to-br from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-br from-green-500 to-emerald-500'
                  }`}
                >
                  {isHigh ? (
                    <AlertTriangle size={15} />
                  ) : isMedium ? (
                    <Info size={15} />
                  ) : (
                    <CheckCircle size={15} />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[14px] font-semibold text-slate-900">
                      {risk.title}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${
                        isHigh
                          ? 'bg-red-500'
                          : isMedium
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                    >
                      {isHigh ? '높음' : isMedium ? '보통' : '낮음'}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-6 text-slate-600">
                    {risk.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const SummaryCards = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="min-w-0 rounded-[22px] border border-slate-100 bg-white px-5 py-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-sky-50 text-sky-600">
            <Calendar size={18} />
          </div>
          <div className="min-w-0 pt-1">
            <span className="block text-[15px] font-medium text-slate-500">
              계약 기간
            </span>
          </div>
        </div>
        <div className="mt-6 text-[24px] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[28px]">
          {analysis.contractPeriod}
        </div>
        <p className="mt-2 text-[14px] leading-7 text-slate-500">
          {analysis.contractPeriodDetail}
        </p>
      </div>

      <div className="min-w-0 rounded-[22px] border border-slate-100 bg-white px-5 py-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-50 text-emerald-600">
            <DollarSign size={18} />
          </div>
          <div className="min-w-0 pt-1">
            <span className="block text-[15px] font-medium text-slate-500">
              월 급여
            </span>
          </div>
        </div>
        <div className="mt-6 text-[24px] font-semibold tracking-[-0.04em] text-slate-900 sm:text-[28px]">
          {analysis.salary}
        </div>
        <p className="mt-2 text-[14px] leading-7 text-slate-500">
          {analysis.salaryDetail}
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.18) 0%, rgba(95,117,177,0.06) 24%, transparent 48%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24">
        <header className="flex h-[72px] items-center sm:h-20">
          <div className="flex w-[120px] items-center justify-start sm:w-[160px]">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-500 transition-colors hover:text-slate-800 sm:text-[15px]"
            >
              <ArrowLeft size={18} strokeWidth={2.2} />
              뒤로
            </button>
          </div>

          <div className="flex-1 text-center">
            <span className="pointer-events-none text-[18px] font-medium tracking-[0.18em] text-slate-700 sm:text-[22px] lg:text-[24px]">
              CLAIR.
            </span>
          </div>

          <div className="ml-auto flex w-[120px] items-center justify-end gap-2 sm:w-[160px] sm:gap-3">
            <button
              type="button"
              className="hidden h-[52px] min-w-[92px] items-center justify-center gap-2 whitespace-nowrap rounded-full border border-white/80 bg-white/82 px-5 text-[15px] font-medium text-slate-600 shadow-sm backdrop-blur lg:inline-flex"
            >
              <Share2 size={16} className="shrink-0" />
              <span>공유</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex h-[52px] min-w-[120px] items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-[15px] font-semibold leading-none text-white shadow-sm transition-all hover:-translate-y-0.5 sm:h-[54px] sm:min-w-[132px] sm:px-6"
              style={{
                background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
              }}
            >
              <Download size={16} className="shrink-0" />
              <span className="whitespace-nowrap">다운로드</span>
            </button>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center pb-10 sm:pb-12">
          <section className="mx-auto w-full max-w-[720px] lg:max-w-[1080px]">
            <div className="mx-auto max-w-[560px] text-center">
              <div className="mb-4 inline-flex items-center justify-center rounded-full border border-white/90 bg-white/82 px-4 py-2 text-center text-[12px] font-medium text-slate-500 shadow-sm backdrop-blur sm:mb-6 sm:px-5 sm:py-2.5 sm:text-[13px]">
                Result
              </div>

              <h1 className="text-[28px] font-semibold leading-[1.12] tracking-[-0.05em] text-slate-900 sm:text-[40px] lg:text-[52px]">
                분석 결과
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-slate-500 sm:text-[16px] sm:leading-8 lg:text-[18px]">
                업로드한 계약서를 분석한 결과를 확인해보세요.
              </p>

              <div className="mt-4 rounded-[20px] border border-white/90 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                <p className="truncate text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                  {analysis.fileName}
                </p>
                <p className="mt-1 text-[12px] text-slate-500 sm:text-[13px]">
                  {isLoading ? '분석 결과 불러오는 중' : analysis.analyzedDate}
                </p>
              </div>
            </div>

            <div className="mx-auto mt-7 lg:hidden">
              <div className="overflow-hidden rounded-[28px] border border-white/90 bg-white/80 shadow-[0_30px_70px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="border-b border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(238,242,249,0.72)_100%)] px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-[16px] text-white shadow-lg sm:h-12 sm:w-12 sm:rounded-[18px]"
                      style={{
                        background:
                          'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                      }}
                    >
                      <Bot size={20} className="sm:h-6 sm:w-6" />
                    </div>

                    <div>
                      <h2 className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">
                        AI 어시스턴트
                      </h2>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-[13px] text-slate-500">
                          {isLoading ? '불러오는 중' : '분석 완료'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="rounded-[24px] border border-slate-100 bg-[#F8FAFF] p-5">
                    <div className="flex flex-col items-center text-center">
                      <ScoreRing score={safetyScore} />

                      <h3 className="mt-4 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
                        계약 안정도
                      </h3>
                      <p className="mt-1 text-[14px] text-slate-500">{scoreLabel}</p>

                      <div className="mt-5 grid w-full grid-cols-3 gap-3">
                        <div className="rounded-[18px] bg-white p-3">
                          <div className="flex items-center justify-center gap-1 text-red-500">
                            <AlertTriangle size={15} />
                            <span className="text-[18px] font-semibold">{riskCounts.high}</span>
                          </div>
                          <p className="mt-1 text-[12px] text-slate-500">높음</p>
                        </div>

                        <div className="rounded-[18px] bg-white p-3">
                          <div className="flex items-center justify-center gap-1 text-amber-500">
                            <Info size={15} />
                            <span className="text-[18px] font-semibold">{riskCounts.medium}</span>
                          </div>
                          <p className="mt-1 text-[12px] text-slate-500">보통</p>
                        </div>

                        <div className="rounded-[18px] bg-white p-3">
                          <div className="flex items-center justify-center gap-1 text-emerald-500">
                            <CheckCircle size={15} />
                            <span className="text-[18px] font-semibold">{riskCounts.low}</span>
                          </div>
                          <p className="mt-1 text-[12px] text-slate-500">낮음</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <SummaryCards />
                  </div>

                  {!showMobileDetail && (
                    <button
                      type="button"
                      onClick={() => setShowMobileDetail(true)}
                      className="mt-4 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[18px] text-[14px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5"
                      style={{
                        background:
                          'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                      }}
                    >
                      상세 분석 보기
                      <ChevronDown size={16} />
                    </button>
                  )}

                  {showMobileDetail && (
                    <div className="mt-4 space-y-4">
                      <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#6C80DD]" />
                          <h3 className="text-[15px] font-semibold text-slate-900">
                            주요 확인 포인트
                          </h3>
                        </div>

                        <div className="mt-4 rounded-[18px] bg-[#F8FAFF] p-4">
                          <p className="text-[14px] font-medium leading-6 text-slate-900">
                            {analysis.summaryText}
                          </p>
                        </div>

                        <div className="mt-4">
                          <RiskCards />
                        </div>
                      </div>

                      <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setShowQuestions((prev) => !prev)}
                          className="flex w-full items-center justify-between"
                        >
                          <span className="text-[15px] font-semibold text-slate-900">
                            추천 질문
                          </span>
                          {showQuestions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        {showQuestions && (
                          <div className="mt-4 space-y-2">
                            {suggestedQuestions.map((question, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => handleQuestionClick(question)}
                                className="w-full rounded-[18px] border border-slate-100 bg-[#F8FAFF] px-4 py-3 text-left text-[14px] font-medium text-slate-700 transition-all hover:border-[#DCE4FF] hover:bg-white"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSendMessage();
                            }}
                            placeholder="질문하기"
                            className="h-[48px] flex-1 rounded-[18px] border border-slate-200/80 bg-white px-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8]"
                          />
                          <button
                            type="button"
                            onClick={() => handleSendMessage()}
                            className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-[18px] text-white shadow-sm transition-all hover:-translate-y-0.5"
                            style={{
                              background:
                                'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                            }}
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowMobileDetail(false)}
                        className="w-full text-[14px] font-medium text-slate-500"
                      >
                        간단 보기로 돌아가기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mx-auto mt-7 hidden overflow-hidden rounded-[28px] border border-white/90 bg-white/80 shadow-[0_30px_70px_rgba(15,23,42,0.10)] backdrop-blur lg:block sm:rounded-[32px]">
              <div className="border-b border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(238,242,249,0.72)_100%)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[16px] text-white shadow-lg sm:h-12 sm:w-12 sm:rounded-[18px]"
                    style={{
                      background:
                        'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                    }}
                  >
                    <Bot size={20} className="sm:h-6 sm:w-6" />
                  </div>

                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">
                      AI 어시스턴트
                    </h2>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[13px] text-slate-500">
                        {isLoading ? '불러오는 중' : '분석 완료'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid min-h-[720px] lg:grid-cols-[1.05fr_0.95fr]">
                <div className="p-4 sm:p-6 lg:border-r lg:border-slate-100/80">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div key={index}>
                        {message.type === 'text' && (
                          <div
                            className={`flex gap-3 ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {message.role === 'bot' && (
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-white"
                                style={{
                                  background:
                                    'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                                }}
                              >
                                <Bot size={16} />
                              </div>
                            )}

                            <div
                              className={`max-w-[82%] whitespace-pre-line rounded-[20px] px-4 py-3 text-[14px] leading-6 sm:max-w-[75%] sm:text-[15px] ${
                                message.role === 'bot'
                                  ? 'rounded-tl-[8px] border border-white/90 bg-white text-slate-800 shadow-sm'
                                  : 'rounded-tr-[8px] bg-[#6C80DD] text-white shadow-sm'
                              }`}
                            >
                              {message.text}
                            </div>

                            {message.role === 'user' && (
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-slate-800 text-white">
                                <UserIcon size={16} />
                              </div>
                            )}
                          </div>
                        )}

                        {message.type === 'summary' && (
                          <div className="flex gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-white"
                              style={{
                                background:
                                  'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                              }}
                            >
                              <Bot size={16} />
                            </div>

                            <div className="max-w-xl flex-1">
                              <SummaryCards />
                            </div>
                          </div>
                        )}

                        {message.type === 'risks' && (
                          <div className="flex gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-white"
                              style={{
                                background:
                                  'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                              }}
                            >
                              <Bot size={16} />
                            </div>

                            <div className="max-w-xl flex-1 space-y-3">
                              <div className="rounded-[20px] border border-white/90 bg-white px-4 py-3 shadow-sm">
                                <p className="text-[15px] font-medium text-slate-900">
                                  주요 위험 요소를 확인했어요.
                                </p>
                              </div>

                              <RiskCards />
                            </div>
                          </div>
                        )}

                        {message.type === 'score' && (
                          <div className="flex gap-3">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-white"
                              style={{
                                background:
                                  'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                              }}
                            >
                              <Bot size={16} />
                            </div>

                            <div className="flex-1">
                              <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-6">
                                  <ScoreRing
                                    score={safetyScore}
                                    size={128}
                                    strokeWidth={16}
                                    numberFontSize={32}
                                  />

                                  <div className="flex-1">
                                    <h3 className="text-[28px] font-semibold tracking-[-0.04em] text-slate-900">
                                      계약 안정도
                                    </h3>
                                    <p className="mt-2 text-[15px] text-slate-500">
                                      {scoreLabel}
                                    </p>

                                    <div className="mt-5 flex gap-5">
                                      <div className="text-center">
                                        <div className="flex items-center gap-1 text-red-500">
                                          <AlertTriangle size={16} />
                                          <span className="text-[20px] font-semibold">
                                            {riskCounts.high}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-[12px] text-slate-500">높음</p>
                                      </div>

                                      <div className="text-center">
                                        <div className="flex items-center gap-1 text-amber-500">
                                          <Info size={16} />
                                          <span className="text-[20px] font-semibold">
                                            {riskCounts.medium}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-[12px] text-slate-500">보통</p>
                                      </div>

                                      <div className="text-center">
                                        <div className="flex items-center gap-1 text-emerald-500">
                                          <CheckCircle size={16} />
                                          <span className="text-[20px] font-semibold">
                                            {riskCounts.low}
                                          </span>
                                        </div>
                                        <p className="mt-1 text-[12px] text-slate-500">낮음</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <p className="mt-4 text-[12px] leading-5 text-slate-400">
                                  안정도 점수는 감지된 위험 요소의 개수와 위험도를 기준으로 계산된 참고용 점수입니다.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {messages.length <= 6 && (
                      <div className="pt-2">
                        <p className="mb-3 text-[14px] font-semibold text-slate-800">
                          추천 질문
                        </p>
                        <div className="space-y-2">
                          {suggestedQuestions.map((question, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleQuestionClick(question)}
                              className="w-full rounded-[18px] border border-slate-100 bg-white px-4 py-3 text-left text-[14px] font-medium text-slate-700 transition-all hover:border-[#DCE4FF] hover:bg-[#F8FAFF] sm:text-[15px]"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden min-h-[720px] flex-col bg-white/30 lg:flex">
                  <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                    {messages
                      .filter((message) => message.type === 'text')
                      .map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'bot' && (
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] text-white"
                              style={{
                                background:
                                  'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                              }}
                            >
                              <Bot size={16} />
                            </div>
                          )}

                          <div
                            className={`max-w-[82%] whitespace-pre-line rounded-[20px] px-4 py-3 text-[14px] leading-6 sm:max-w-[75%] sm:text-[15px] ${
                              message.role === 'bot'
                                ? 'rounded-tl-[8px] border border-white/90 bg-white text-slate-800 shadow-sm'
                                : 'rounded-tr-[8px] bg-[#6C80DD] text-white shadow-sm'
                            }`}
                          >
                            {message.text}
                          </div>

                          {message.role === 'user' && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-slate-800 text-white">
                              <UserIcon size={16} />
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  <div className="border-t border-slate-100 bg-white/70 p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendMessage();
                        }}
                        placeholder="계약서에 대해 질문하세요..."
                        className="h-[50px] flex-1 rounded-[18px] border border-slate-200/80 bg-white px-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-[52px] sm:text-[15px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-[18px] text-white shadow-sm transition-all hover:-translate-y-0.5 sm:h-[52px] sm:w-[52px]"
                        style={{
                          background:
                            'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)',
                        }}
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}