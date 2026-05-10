import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Bot,
  Send,
  Mic,
  MicOff,
} from 'lucide-react';

type MessageType = 'text' | 'score' | 'summary' | 'risks';
type Role = 'bot' | 'user';

type Message = {
  role: Role;
  text: string;
  type: MessageType;
};

// 백엔드 risk_level(high/medium/low) → 안정도 점수 계산
function computeSafetyScore(riskClauses: any[]): number {
  if (!riskClauses || riskClauses.length === 0) return 90;
  const levels = riskClauses.map((r) => r.risk_level?.toLowerCase());
  if (levels.includes('high')) return 42;
  if (levels.includes('medium')) return 65;
  return 80;
}

export function ResultDashboard() {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();

  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisMessages, setAnalysisMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatSessionId = useRef<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const toggleSTT = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('이 브라우저는 음성 인식을 지원하지 않아요. Chrome을 사용해주세요.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInputMessage((prev) => (prev ? prev + ' ' + transcript : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // 분석 결과 로드
  // src/pages/ResultDashboard.tsx 내부 useEffect 수정

  useEffect(() => {
    const fetchAnalysisResult = async () => {
      if (!contractId) return;
      try {
        setLoading(true);
        const response = await client.get(`/api/v1/contracts/${contractId}`);
        const data = response.data;
        setAnalysisData(data);

        // 1. 점수 및 요약 데이터 추출 (백엔드 구조에 맞춰 접근)
        const score = data.analysis?.total_score || computeSafetyScore(data.risk_clauses || []);
        const scoreLabel = score >= 80 ? '안정적' : score >= 60 ? '확인 필요' : '주의 필요';
        const summary = data.analysis?.summary || '';
        const keyInfo = data.analysis?.key_info || {};

        // 2. 화면에 보여줄 주요 정보 텍스트 구성
        const infoText = `
  📌 **주요 계약 정보**
  • 계약 종류: ${keyInfo.contract_type || '미탐지'}
  • 계약 기간: ${keyInfo.start_date || '-'} ~ ${keyInfo.end_date || '-'}
  • 주요 금액: ${keyInfo.amount_text || '정보 없음'}
        `.trim();

        setAnalysisMessages([
          { role: 'bot', text: '분석이 완료되었어요.', type: 'text' },
          { role: 'bot', text: '', type: 'score' },
          {
            role: 'bot',
            // 요약 내용과 주요 정보를 합쳐서 출력
            text: `${infoText}\n\n계약 안정도는 ${score}점(${scoreLabel})입니다.\n\n${summary}`,
            type: 'text',
          },
          { role: 'bot', text: '', type: 'risks' },
          { role: 'bot', text: '궁금한 점이 있으면 아래 채팅창에 물어보세요!', type: 'text' },
        ]);

        setChatMessages([
          { role: 'bot', text: '안녕하세요! 분석된 내용을 바탕으로 궁금한 점을 질문해주세요.', type: 'text' },
        ]);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysisResult();
  }, [contractId]);

  // 채팅 세션 생성 (첫 메시지 전송 시 lazily 생성)
  const ensureChatSession = async (): Promise<number | null> => {
    if (chatSessionId.current) return chatSessionId.current;
    try {
      const res = await client.post('/api/v1/chat/sessions', {
        contract_id: contractId ? Number(contractId) : null,
        title: `계약서 #${contractId} 질문`,
      });
      chatSessionId.current = res.data.id;
      return res.data.id;
    } catch (e) {
      console.error('채팅 세션 생성 실패:', e);
      return null;
    }
  };

  const handleSendMessage = async (preset?: string) => {
    const messageToSend = (preset ?? inputMessage).trim();
    if (!messageToSend || isSending) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: messageToSend, type: 'text' }]);
    setInputMessage('');
    setIsSending(true);

    try {
      const sessionId = await ensureChatSession();
      if (!sessionId) throw new Error('세션 없음');

      const res = await client.post(`/api/v1/chat/sessions/${sessionId}/messages`, {
        content: messageToSend,
      });

      const aiContent = res.data.ai_message?.content || '답변을 가져오지 못했습니다.';
      setChatMessages((prev) => [...prev, { role: 'bot', text: aiContent, type: 'text' }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'bot', text: '답변을 가져오는 중 오류가 발생했습니다.', type: 'text' },
      ]);
    } finally {
      setIsSending(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const safetyScore = computeSafetyScore(analysisData?.risk_clauses || []);
  const scoreLabel = safetyScore >= 80 ? '안정적' : safetyScore >= 60 ? '확인 필요' : '주의 필요';

  const ScoreRing = ({ score }: { score: number }) => {
    const size = 128;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - score / 100);
    return (
      <div className="shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={64} cy={64} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
          <circle cx={64} cy={64} r={radius} fill="none" stroke="#6C80DD" strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            strokeLinecap="round" transform="rotate(-90 64 64)" />
          <text x="50%" y="45%" textAnchor="middle" fill="#0F172A" fontSize="30" fontWeight="600">{score}</text>
          <text x="50%" y="65%" textAnchor="middle" fill="#64748B" fontSize="12">점</text>
        </svg>
      </div>
    );
  };

  const riskLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      default: return 'text-blue-400';
    }
  };

  const riskLevelLabel = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return '높음';
      case 'medium': return '중간';
      default: return '낮음';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#667AF2] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-[1280px] px-6">
        <header className="flex h-20 items-center justify-between">
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft size={20} /> <span className="font-medium">뒤로</span>
          </button>
          <h1 className="text-2xl font-bold tracking-widest text-slate-800">CLAIR.</h1>
          <div className="w-20" />
        </header>

        <main className="mt-10 pb-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">

            {/* 왼쪽: 분석 리포트 */}
            <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2">
              {analysisMessages.map((msg, idx) => (
                <div key={idx} className="flex gap-4">
                  {msg.role === 'bot' && (
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#667AF2] text-white shadow-sm">
                      <Bot size={22} />
                    </div>
                  )}
                  <div className="flex-1">
                    {msg.type === 'text' && msg.text && (
                      <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </div>
                    )}
                    {msg.type === 'score' && (
                      <div className="p-8 bg-white rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-10">
                        <ScoreRing score={safetyScore} />
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">계약 안정도 분석</p>
                          <h3 className="text-2xl font-bold text-slate-900">{scoreLabel}</h3>
                          <p className="text-sm text-slate-400 mt-1">
                            위험 조항 {(analysisData?.risk_clauses || []).length}개 감지됨
                          </p>
                        </div>
                      </div>
                    )}
                    {msg.type === 'risks' && (
                      <div className="space-y-3">
                        {(analysisData?.risk_clauses || []).length === 0 ? (
                          <div className="p-4 bg-white border border-slate-100 rounded-xl flex gap-3 shadow-sm">
                            <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                            <p className="text-sm text-slate-600">특별한 위험 조항이 감지되지 않았습니다.</p>
                          </div>
                        ) : (
                          (analysisData?.risk_clauses || []).map((risk: any, i: number) => (
                            <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl flex gap-3 shadow-sm">
                              <AlertTriangle className={`shrink-0 ${riskLevelColor(risk.risk_level)}`} size={20} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-900 text-sm">{risk.risk_type}</p>
                                  <span className={`text-xs font-medium ${riskLevelColor(risk.risk_level)}`}>
                                    [{riskLevelLabel(risk.risk_level)}]
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{risk.explanation}</p>
                                {risk.evidence_text && (
                                  <p className="text-xs text-slate-400 mt-1 italic">"{risk.evidence_text}"</p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 오른쪽: 실시간 채팅 */}
            <div className="flex flex-col h-[75vh] bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-5 border-b flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-bold text-slate-700">AI 계약 상담소</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-[15px] shadow-sm whitespace-pre-line ${
                      msg.role === 'user' ? 'bg-[#6C80DD] text-white' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-400 p-4 rounded-2xl text-sm">답변 생성 중...</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 추천 질문 */}
              <div style={{ padding: '12px 20px 4px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['계약 기간이 얼마야?', '주요 위험 조항 알려줘', '급여 조건 설명해줘'].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      padding: '7px 16px',
                      borderRadius: 20,
                      border: 'none',
                      background: '#EEF3FF',
                      color: '#5569E0',
                      cursor: 'pointer',
                      boxShadow: '0 1px 4px rgba(102,122,242,0.10)',
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="p-5 border-t bg-slate-50/30">
                <div className="flex gap-2">
                  <input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder={isListening ? '듣고 있어요...' : '조항에 대해 질문하세요...'}
                    className="flex-1 h-12 px-5 rounded-2xl border border-slate-200 outline-none focus:border-[#667AF2] bg-white transition-all"
                    disabled={isSending}
                  />
                  <button
                    onClick={toggleSTT}
                    title="음성으로 입력"
                    style={{
                      width: 48, height: 48, borderRadius: 16, border: 'none', flexShrink: 0,
                      background: isListening ? '#EF4444' : '#F1F5F9',
                      color: isListening ? '#fff' : '#64748B',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.2s',
                    }}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isSending}
                    style={{
                      width: 48, height: 48, borderRadius: 16, border: 'none', flexShrink: 0,
                      background: '#667AF2', color: '#fff', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: isSending ? 0.5 : 1,
                    }}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
