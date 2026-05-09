import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import {
  ArrowLeft, Send, Bot, AlertTriangle, CheckCircle,
  Info, Calendar, DollarSign, Share2, Download,
} from 'lucide-react';

type MessageType = 'text' | 'score' | 'summary' | 'risks';
type Role = 'bot' | 'user';
type Message = { role: Role; text: string; type: MessageType };

function computeSafetyScore(riskClauses: any[]): number {
  if (!riskClauses?.length) return 90;
  const levels = riskClauses.map((r) => r.risk_level?.toLowerCase());
  if (levels.includes('high')) return 42;
  if (levels.includes('medium')) return 65;
  return 80;
}

const ScoreRing = ({ score }: { score: number }) => {
  const size = 96, sw = 12, r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="44%" textAnchor="middle" fill="#0F172A" fontSize="22" fontWeight="700">{score}</text>
      <text x="50%" y="64%" textAnchor="middle" fill="#94A3B8" fontSize="10">점</text>
    </svg>
  );
};

const riskColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case 'high': return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500', badge: 'bg-red-100 text-red-700', label: '높음' };
    case 'medium': return { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', label: '중간' };
    default: return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-400', badge: 'bg-blue-100 text-blue-700', label: '낮음' };
  }
};

export function ResultDashboard() {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'bot', text: '안녕하세요! 계약서에 대해 궁금한 점을 물어보세요.', type: 'text' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatSessionId = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contractId) return;
    client.get(`/api/v1/contracts/${contractId}`)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [contractId]);

  const ensureSession = async () => {
    if (chatSessionId.current) return chatSessionId.current;
    const res = await client.post('/api/v1/chat/sessions', {
      contract_id: Number(contractId),
      title: `계약서 #${contractId} 질문`,
    });
    chatSessionId.current = res.data.id;
    return res.data.id;
  };

  const handleSend = async (preset?: string) => {
    const msg = (preset ?? inputMessage).trim();
    if (!msg || isSending) return;
    setChatMessages((p) => [...p, { role: 'user', text: msg, type: 'text' }]);
    setInputMessage('');
    setIsSending(true);
    try {
      const sid = await ensureSession();
      const res = await client.post(`/api/v1/chat/sessions/${sid}/messages`, { content: msg });
      setChatMessages((p) => [...p, { role: 'bot', text: res.data.ai_message?.content || '답변을 가져오지 못했습니다.', type: 'text' }]);
    } catch {
      setChatMessages((p) => [...p, { role: 'bot', text: '오류가 발생했습니다.', type: 'text' }]);
    } finally {
      setIsSending(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#667AF2] border-t-transparent mx-auto" />
        <p className="mt-3 text-slate-500 text-sm">불러오는 중...</p>
      </div>
    </div>
  );

  const riskClauses = data?.risk_clauses || [];
  const keyInfo = data?.analysis?.key_info || {};
  const summary = data?.analysis?.summary || '';
  const score = computeSafetyScore(riskClauses);
  const scoreLabel = score >= 80 ? '안정적' : score >= 60 ? '확인 필요' : '주의 필요';
  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';

  const highCount = riskClauses.filter((r: any) => r.risk_level?.toLowerCase() === 'high').length;
  const medCount = riskClauses.filter((r: any) => r.risk_level?.toLowerCase() === 'medium').length;
  const lowCount = riskClauses.filter((r: any) => r.risk_level?.toLowerCase() === 'low').length;

  const startDate = keyInfo.start_date?.value;
  const endDate = keyInfo.end_date?.value;
  const amountText = keyInfo.amount_text?.value;

  const suggestedQuestions = ['이 계약서의 주요 위험 요소는?', '초과 근무 수당은 어떻게 되나요?', '계약 해지 조건이 어떻게 되나요?'];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="mx-auto max-w-[1280px] px-6 flex h-16 items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium">
            <ArrowLeft size={18} /> 뒤로
          </button>
          <span className="text-xl font-bold tracking-widest text-slate-800">CLAIR.</span>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">
              <Share2 size={15} /> 공유
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-white transition-colors"
              style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)' }}>
              <Download size={15} /> 다운로드
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 py-8">
        {/* 타이틀 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500 mb-3">Result</div>
          <h1 className="text-3xl font-bold text-slate-900">분석 결과</h1>
          <p className="mt-2 text-slate-500 text-sm">업로드된 계약서를 분석한 결과를 확인해보세요.</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm text-slate-600 shadow-sm">
            <span className="font-medium">{data?.original_filename}</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">분석 완료</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_420px] gap-6">
          {/* 왼쪽: AI 분석 리포트 */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* 패널 헤더 */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)' }}>
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">AI 어시스턴트</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-slate-400">분석 완료</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* 메시지: 분석 완료 */}
              <BotMessage text="분석이 완료되었어요." />

              {/* 점수 카드 */}
              <div className="rounded-2xl border border-slate-100 bg-[#F8FAFF] p-5 flex items-center gap-6">
                <ScoreRing score={score} />
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">계약 안정도</p>
                  <h3 className={`text-2xl font-bold ${scoreColor}`}>{scoreLabel}</h3>
                  <p className="text-xs text-slate-400 mt-1">{score}점</p>
                  <div className="flex items-center gap-3 mt-3">
                    {highCount > 0 && <RiskBadge count={highCount} label="높음" color="text-red-500 bg-red-50" />}
                    {medCount > 0 && <RiskBadge count={medCount} label="보통" color="text-amber-500 bg-amber-50" />}
                    {lowCount > 0 && <RiskBadge count={lowCount} label="낮음" color="text-blue-400 bg-blue-50" />}
                    {riskClauses.length === 0 && <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">위험 조항 없음</span>}
                  </div>
                </div>
              </div>

              {/* 요약 */}
              {summary && (
                <BotMessage text={summary} />
              )}

              {/* 핵심 정보 카드 */}
              {(startDate || amountText) && (
                <div className="grid grid-cols-2 gap-3">
                  {(startDate || endDate) && (
                    <div className="rounded-2xl border border-slate-100 bg-[#F8FAFF] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-[#EEF2F9]">
                          <Calendar size={14} className="text-[#6C80DD]" />
                        </div>
                        <span className="text-xs text-slate-400">계약 기간</span>
                      </div>
                      <p className="text-base font-bold text-slate-900">
                        {startDate && endDate
                          ? `${startDate} ~ ${endDate}`
                          : startDate || endDate || '-'}
                      </p>
                    </div>
                  )}
                  {amountText && (
                    <div className="rounded-2xl border border-slate-100 bg-[#F8FAFF] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-50">
                          <DollarSign size={14} className="text-emerald-600" />
                        </div>
                        <span className="text-xs text-slate-400">계약 금액</span>
                      </div>
                      <p className="text-base font-bold text-slate-900">{amountText}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 위험 조항 */}
              {riskClauses.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">주요 위험 요소를 확인했어요.</p>
                  <div className="space-y-2">
                    {riskClauses.map((risk: any, i: number) => {
                      const c = riskColor(risk.risk_level);
                      return (
                        <div key={i} className={`rounded-xl border ${c.border} ${c.bg} p-4 flex gap-3`}>
                          <AlertTriangle className={`shrink-0 mt-0.5 ${c.icon}`} size={16} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-slate-800">{risk.risk_type}</span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.badge}`}>{c.label}</span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{risk.explanation}</p>
                            {risk.evidence_text && (
                              <p className="text-xs text-slate-400 mt-1 italic">"{risk.evidence_text}"</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {riskClauses.length === 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
                  <CheckCircle className="text-emerald-500 shrink-0" size={16} />
                  <p className="text-sm text-emerald-700">특별한 위험 조항이 감지되지 않았습니다.</p>
                </div>
              )}

              <BotMessage text="계약서에 대해 궁금한 점이 있으면 편하게 물어보세요." />
            </div>
          </div>

          {/* 오른쪽: 채팅 */}
          <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden sticky top-24">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-700">AI 계약 상담소</span>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#667AF2] text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 text-slate-400 px-4 py-3 rounded-2xl rounded-bl-sm text-sm">답변 생성 중...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 추천 질문 */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q) => (
                <button key={q} onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#667AF2]/40 text-[#667AF2] hover:bg-[#EEF3FF] transition-colors">
                  {q}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="계약서에 대해 질문하세요..."
                  disabled={isSending}
                  className="flex-1 h-11 px-4 rounded-2xl border border-slate-200 text-sm outline-none focus:border-[#667AF2] bg-white transition-all"
                />
                <button onClick={() => handleSend()} disabled={isSending}
                  className="h-11 w-11 flex items-center justify-center rounded-2xl text-white transition-colors disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)' }}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BotMessage({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-xl text-white shadow-sm"
        style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)' }}>
        <Bot size={15} />
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-sm border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700 leading-relaxed shadow-sm">
        {text}
      </div>
    </div>
  );
}

function RiskBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {label} {count}
    </span>
  );
}
