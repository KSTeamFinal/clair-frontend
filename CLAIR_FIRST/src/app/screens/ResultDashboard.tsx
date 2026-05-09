import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../api/client';
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Bot,
  Send,
  User as UserIcon,
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

export function ResultDashboard() {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();
  
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisMessages, setAnalysisMessages] = useState<Message[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 데이터 로드 및 무한 루프 방지
  useEffect(() => {
    const fetchAnalysisResult = async () => {
      if (!contractId) return;
      
      try {
        setLoading(true);
        // 스크린샷에 확인된 엔드포인트 구조 반영
        const response = await client.get(`/api/v1/contracts/${contractId}`);
        const data = response.data;
        setAnalysisData(data);

        // 초기 대화 구성
        setAnalysisMessages([
          { role: 'bot', text: '분석이 완료되었어요.', type: 'text' },
          { role: 'bot', text: '', type: 'score' },
          {
            role: 'bot',
            text: data.overall_comment || `계약 안정도는 ${data.safety_score}점입니다.`,
            type: 'text',
          },
          { role: 'bot', text: '', type: 'summary' },
          { role: 'bot', text: '', type: 'risks' },
          { role: 'bot', text: '궁금한 점이 있으면 물어보세요.', type: 'text' },
        ]);

        setChatMessages([
          { role: 'bot', text: '분석 결과입니다.', type: 'text' },
        ]);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisResult();
    // 의존성 배열에 contractId만 넣어 무한 호출 방지
  }, [contractId]);

  const safetyScore = analysisData?.safety_score || 0;
  const scoreLabel = safetyScore >= 80 ? '안정적' : safetyScore >= 60 ? '확인 필요' : '주의 필요';

  // 2. 채팅 전송 로직
  const handleSendMessage = async (preset?: string) => {
    const messageToSend = preset ?? inputMessage;
    if (!messageToSend.trim()) return;

    setChatMessages((prev) => [...prev, { role: 'user', text: messageToSend, type: 'text' }]);
    setInputMessage('');

    try {
      const response = await client.post(`/api/v1/chat/${contractId}`, { query: messageToSend });
      setChatMessages((prev) => [
        ...prev, 
        { role: 'bot', text: response.data.answer, type: 'text' }
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev, 
        { role: 'bot', text: "답변을 가져오는 중 오류가 발생했습니다.", type: 'text' }
      ]);
    }
  };

  // --- 하위 컴포넌트 (문법 오류 수정 완료) ---
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
          <circle cx={64} cy={64} r={radius} fill="none" stroke="#6C80DD" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 64 64)" />
          <text x="50%" y="45%" textAnchor="middle" fill="#0F172A" fontSize="30" fontWeight="600">{score}</text>
          <text x="50%" y="65%" textAnchor="middle" fill="#64748B" fontSize="12">점</text>
        </svg>
      </div>
    );
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
          <div className="w-20"></div> {/* 벨런스용 */}
        </header>

        <main className="mt-10 pb-20">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
            
            {/* 왼쪽: 분석 리포트 */}
            <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-4">
              {analysisMessages.map((msg, idx) => (
                <div key={idx} className="flex gap-4">
                  {msg.role === 'bot' && (
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-[#667AF2] text-white shadow-sm">
                      <Bot size={22} />
                    </div>
                  )}
                  <div className="flex-1">
                    {msg.type === 'text' && msg.text && (
                      <div className="p-5 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-700 leading-relaxed">
                        {msg.text}
                      </div>
                    )}
                    {msg.type === 'score' && (
                      <div className="p-8 bg-white rounded-[28px] shadow-sm border border-slate-100 flex items-center gap-10">
                        <ScoreRing score={safetyScore} />
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">계약 안정도 분석</p>
                          <h3 className="text-2xl font-bold text-slate-900">{scoreLabel}</h3>
                        </div>
                      </div>
                    )}
                    {msg.type === 'risks' && analysisData?.risks?.map((risk: any, i: number) => (
                      <div key={i} className="mt-3 p-4 bg-white border border-slate-100 rounded-xl flex gap-3 shadow-sm">
                        <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{risk.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{risk.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 오른쪽: 실시간 채팅 */}
            <div className="flex flex-col h-[75vh] bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-5 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-slate-700">AI 계약 상담소</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-[15px] shadow-sm ${
                      msg.role === 'user' ? 'bg-[#6C80DD] text-white' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t bg-slate-50/30">
                <div className="flex gap-2">
                  <input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="조항에 대해 질문하세요..."
                    className="flex-1 h-12 px-5 rounded-2xl border border-slate-200 outline-none focus:border-[#667AF2] bg-white transition-all"
                  />
                  <button onClick={() => handleSendMessage()} className="h-12 w-12 flex items-center justify-center bg-[#667AF2] text-white rounded-2xl hover:bg-[#5569E0] transition-colors">
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