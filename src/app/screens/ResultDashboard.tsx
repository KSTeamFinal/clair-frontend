import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import {
  ArrowLeft,
  Bot,
  Send,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  Activity,
} from 'lucide-react';

type MessageType = 'text' | 'score' | 'summary' | 'risks' | 'info';
type Role = 'bot' | 'user';

type Message = {
  role: Role;
  text: string;
  type: MessageType;
};

export function ResultDashboard() {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();

  const [inputMessage, setInputMessage] = useState('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisMessages, setAnalysisMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateSafetyScore = (risks: any[]) => {
    if (!risks || risks.length === 0) return 95;

    let penalty = 0;

    risks.forEach((risk) => {
      const level = String(
        risk.severity ?? risk.risk_level ?? risk.level ?? ''
      ).toUpperCase();

      if (level.includes('HIGH') || level.includes('상')) {
        penalty += 12;
      } else if (level.includes('MEDIUM') || level.includes('중')) {
        penalty += 8;
      } else {
        penalty += 5;
      }
    });

    return Math.max(30, 100 - penalty);
  };

  const normalizeAnalysisData = (data: any) => {
    const analysis = data?.analysis_result ?? data?.analysis ?? data;

    const risks =
      data?.risks ??
      data?.risk_clauses ??
      analysis?.risks ??
      analysis?.risk_clauses ??
      analysis?.risk_analysis ??
      analysis?.risk_items ??
      [];

    const calculatedScore = calculateSafetyScore(risks);

    return {
      ...analysis,
      summary:
        data?.summary?.content ??
        data?.summary?.text ??
        data?.summary ??
        analysis?.summary?.content ??
        analysis?.summary?.text ??
        analysis?.summary ??
        data?.report_summary ??
        analysis?.report_summary ??
        '요약 결과가 없습니다.',

      risks,

      extraction:
        data?.extraction ??
        data?.key_info ??
        data?.key_information ??
        analysis?.extraction ??
        analysis?.key_info ??
        analysis?.key_information ??
        {},

      safety_score:
        data?.safety_score ??
        data?.score ??
        data?.risk_score ??
        analysis?.safety_score ??
        analysis?.score ??
        analysis?.risk_score ??
        calculatedScore,
    };
  };

  useEffect(() => {
    const fetchAnalysisResult = async () => {
      if (!contractId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await client.get(
          `/api/v1/contracts/${contractId}/analysis`
        );

        const normalizedData = normalizeAnalysisData(response.data);

        console.log('분석 결과 원본:', response.data);
        console.log('분석 결과 정리본:', normalizedData);

        setAnalysisData(normalizedData);

        setAnalysisMessages([
          {
            role: 'bot',
            text: '분석이 완료되었습니다. 검토 결과를 확인하세요.',
            type: 'text',
          },
          { role: 'bot', text: '', type: 'score' },
          { role: 'bot', text: '', type: 'info' },
          {
            role: 'bot',
            text: normalizedData.summary,
            type: 'text',
          },
          {
            role: 'bot',
            text: '위험 요소가 감지된 조항들입니다. 주의 깊게 검토하세요.',
            type: 'text',
          },
          { role: 'bot', text: '', type: 'risks' },
          {
            role: 'bot',
            text: '위 분석 내용이나 특정 조항에 대해 궁금한 점이 있다면 우측 채팅창에 물어보세요.',
            type: 'text',
          },
        ]);

        setChatMessages([
          {
            role: 'bot',
            text: '안녕하세요! 이 계약서에 대해 무엇이든 물어보세요.',
            type: 'text',
          },
        ]);
      } catch (error) {
        console.error('데이터 로드 실패:', error);

        setAnalysisMessages([
          {
            role: 'bot',
            text: '분석 결과를 불러오는 중 오류가 발생했습니다. 백엔드 응답 또는 API 주소를 확인해주세요.',
            type: 'text',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResult();
  }, [contractId]);

  const safetyScore = Number(analysisData?.safety_score ?? 0);

  const scoreLabel =
    safetyScore >= 80 ? '안정적' : safetyScore >= 60 ? '확인 필요' : '주의 필요';

  const getValue = (field: any, fallback = '-') => {
    if (!field) return fallback;
    if (typeof field === 'string' || typeof field === 'number') return field;
    return field.value ?? field.text ?? fallback;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userQuery = inputMessage;

    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: userQuery, type: 'text' },
    ]);
    setInputMessage('');

    try {
      const response = await client.post(`/api/v1/chat/${contractId}`, {
        query: userQuery,
      });

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: response.data?.answer ?? '답변 결과가 없습니다.',
          type: 'text',
        },
      ]);
    } catch (error) {
      console.error('채팅 응답 실패:', error);

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: '답변을 가져오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          type: 'text',
        },
      ]);
    }
  };

  const ScoreRing = ({ score }: { score: number }) => {
    const safeScore = Math.max(0, Math.min(100, score));
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - safeScore / 100);

    return (
      <div className="shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#667AF2"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text
            x="50%"
            y="45%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#1E293B"
            fontSize="28"
            fontWeight="700"
          >
            {safeScore}
          </text>
          <text
            x="50%"
            y="66%"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="#94A3B8"
            fontSize="11"
            fontWeight="500"
          >
            SAFETY
          </text>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-[#667AF2] border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            계약 분석 리포트 생성 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <header className="flex h-20 items-center justify-between border-b border-slate-100">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-600"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-semibold">DASHBOARD</span>
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#667AF2]" size={24} />
            <span className="text-xl font-black italic tracking-tighter text-slate-800">
              CLAIR.
            </span>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-400">
            ID: {contractId}
          </span>
        </header>

        <main className="mt-8 pb-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_450px]">
            <div className="max-h-[calc(100vh-160px)] space-y-8 overflow-y-auto pr-0 lg:pr-6">
              {analysisMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className="flex gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  {msg.role === 'bot' && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#667AF2] shadow-sm">
                      <Bot size={20} />
                    </div>
                  )}

                  <div className="flex-1">
                    {msg.type === 'text' && msg.text && (
                      <div className="rounded-2xl border border-slate-100 bg-white p-5 text-[15px] leading-relaxed text-slate-700 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
                        {msg.text}
                      </div>
                    )}

                    {msg.type === 'score' && (
                      <div className="flex flex-col items-center gap-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm sm:flex-row sm:gap-12">
                        <ScoreRing score={safetyScore} />
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <Activity size={16} className="text-[#667AF2]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Analysis Result
                            </span>
                          </div>
                          <h3 className="text-3xl font-black text-slate-900">
                            {scoreLabel}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            감지된 위험 요소 {analysisData?.risks?.length ?? 0}개를 기준으로 산정된 점수입니다.
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.type === 'info' && (
                      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-blue-100 bg-[#EEF2FF] p-5">
                          <div className="mb-2 flex items-center gap-2 text-blue-600">
                            <Calendar size={16} />
                            <span className="text-[11px] font-black uppercase">
                              계약 기간
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800">
                            {getValue(analysisData?.extraction?.start_date)} ~{' '}
                            {getValue(analysisData?.extraction?.end_date)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-[#F0FDF4] p-5">
                          <div className="mb-2 flex items-center gap-2 text-emerald-600">
                            <DollarSign size={16} />
                            <span className="text-[11px] font-black uppercase">
                              계약 금액
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-800">
                            {getValue(
                              analysisData?.extraction?.amount_text ??
                                analysisData?.extraction?.amount,
                              '내용 없음'
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {msg.type === 'risks' && (
                      <div className="mt-2 space-y-3">
                        {analysisData?.risks?.length > 0 ? (
                          analysisData.risks.map((risk: any, i: number) => (
                            <div
                              key={i}
                              className="rounded-2xl border border-slate-100 border-l-[6px] border-l-red-500 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                              <div className="mb-2 flex items-center justify-between gap-3">
                                <span className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-red-600">
                                  {risk.risk_type ?? risk.type ?? '위험 요소'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  SEVERITY:{' '}
                                  {risk.severity ?? risk.risk_level ?? risk.level ?? '-'}
                                </span>
                              </div>

                              <p className="text-[14px] font-bold leading-snug text-slate-900">
                                {risk.reason ??
                                  risk.explanation ??
                                  risk.description ??
                                  risk.message ??
                                  '상세 설명 없음'}
                              </p>

                              {(risk.evidence_text ||
                                risk.evidence ||
                                risk.clause_text ||
                                risk.original_text) && (
                                <div className="mt-4 flex items-start gap-2 border-t border-slate-50 pt-3">
                                  <FileText size={14} className="mt-0.5 text-slate-300" />
                                  <p className="text-[12px] italic text-slate-400">
                                    "
                                    {String(
                                      risk.evidence_text ??
                                        risk.evidence ??
                                        risk.clause_text ??
                                        risk.original_text
                                    ).substring(0, 100)}
                                    ..."
                                  </p>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-slate-100 bg-white p-5 text-sm text-slate-500 shadow-sm">
                            감지된 위험 요소가 없습니다.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex h-[calc(100vh-160px)] flex-col overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between border-b bg-slate-50/80 px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-sm font-black uppercase tracking-tight text-slate-800">
                    AI Consultant
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto p-8">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[22px] p-4 px-5 text-[14px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'rounded-tr-none bg-[#667AF2] text-white shadow-lg shadow-blue-200'
                          : 'rounded-tl-none bg-slate-100 text-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-50 bg-white p-6">
                <div className="relative flex items-center">
                  <input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="조항의 의미를 물어보세요..."
                    className="h-14 w-full rounded-2xl border-none bg-slate-50 pl-6 pr-16 text-sm outline-none transition-all focus:ring-2 focus:ring-[#667AF2]/20"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#667AF2] text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                  >
                    <Send size={18} />
                  </button>
                </div>

                <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-widest text-slate-400">
                  Powered by Gemini
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}