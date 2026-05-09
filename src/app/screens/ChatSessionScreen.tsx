import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, MessageCircle, Search, Send,
  Trash2, Clock3, ChevronRight, ChevronDown, X, Loader2,
} from 'lucide-react';
import client from '../../api/client';

// ── 타입 ──────────────────────────────────────────────────────────────────────

type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  time: string;
};

type Session = {
  id: number;
  title: string;
  contract_id: number | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
  messages: Message[];
  messagesLoaded: boolean;
};

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}시간 전`;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function senderToRole(sender: string): 'user' | 'assistant' {
  return sender === 'USER' ? 'user' : 'assistant';
}

// ── 하위 컴포넌트 ─────────────────────────────────────────────────────────────

function SessionListItem({
  session, isActive, onClick, onDelete,
}: {
  session: Session; isActive: boolean; onClick: () => void; onDelete: () => void;
}) {
  return (
    <div className={`rounded-[14px] border p-2.5 transition sm:rounded-[16px] sm:p-3 ${
      isActive ? 'border-[#D7E1FB] bg-[#F8FAFF]' : 'border-white/90 bg-white/88 hover:bg-white'
    }`}>
      <div className="flex items-start gap-2.5">
        <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-start gap-2.5 text-left">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F9]">
            <MessageCircle className="h-[13px] w-[13px] text-[#6C80DD]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-[12px] font-semibold text-slate-900 sm:text-[13px]">{session.title}</h3>
              <span className="shrink-0 text-[10px] text-slate-400">{session.updatedAt}</span>
            </div>
            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-[11px]">{session.preview}</p>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2F9] px-2 py-0.5 text-[#6C80DD]">
                <Clock3 className="h-3 w-3" />{session.createdAt}
              </span>
              {session.messageCount > 0 && <span>{session.messageCount}개</span>}
            </div>
          </div>
        </button>
        <button type="button" onClick={onDelete}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:text-rose-500">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[88%] rounded-[16px] px-3 py-2 sm:max-w-[78%] ${
        isUser ? 'bg-[#6C80DD] text-white' : 'border border-slate-200 bg-white text-slate-700'
      }`}>
        <p className="text-[11px] leading-5 sm:text-[12px]">{message.text}</p>
        <p className={`mt-1 text-[10px] ${isUser ? 'text-white/75' : 'text-slate-400'}`}>{message.time}</p>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────

export default function ChatSessionScreen() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [listOpen, setListOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── 세션 목록 로드 ────────────────────────────────────────────────────────

  const loadSessions = async () => {
    try {
      const res = await client.get('/api/v1/chat/sessions');
      const data = res.data;
      const list: Session[] = (data.sessions || []).map((s: any) => ({
        id: s.id,
        title: s.title,
        contract_id: s.contract_id ?? null,
        createdAt: formatDate(s.created_at),
        updatedAt: formatDate(s.updated_at),
        messageCount: 0,
        preview: s.last_message || '대화를 시작해보세요.',
        messages: [],
        messagesLoaded: false,
      }));
      setSessions(list);
      if (list.length > 0 && !selectedSessionId) {
        setSelectedSessionId(list[0].id);
      }
    } catch (e) {
      console.error('세션 목록 로드 실패:', e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => { loadSessions(); }, []);

  // ── 메시지 목록 로드 ──────────────────────────────────────────────────────

  const loadMessages = async (sessionId: number) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session || session.messagesLoaded) return;

    try {
      const res = await client.get(`/api/v1/chat/sessions/${sessionId}/messages`);
      const data = res.data;
      const messages: Message[] = (data.messages || []).map((m: any) => ({
        id: m.id,
        role: senderToRole(m.sender),
        text: m.content,
        time: formatDate(m.created_at),
      }));
      setSessions((prev) => prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages, messageCount: data.total, messagesLoaded: true }
          : s
      ));
    } catch (e) {
      console.error('메시지 로드 실패:', e);
    }
  };

  useEffect(() => {
    if (selectedSessionId) loadMessages(selectedSessionId);
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, selectedSessionId]);

  // ── 세션 삭제 ─────────────────────────────────────────────────────────────

  const handleConfirmDeleteSession = async () => {
    if (deleteTargetId === null) return;
    try {
      await client.delete(`/api/v1/chat/sessions/${deleteTargetId}`);
      const next = sessions.filter((s) => s.id !== deleteTargetId);
      setSessions(next);
      if (selectedSessionId === deleteTargetId) {
        setSelectedSessionId(next[0]?.id ?? null);
      }
    } catch (e) {
      console.error('세션 삭제 실패:', e);
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  // ── 메시지 전송 ───────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedSessionId || isSending) return;
    const text = messageInput.trim();
    setMessageInput('');
    setIsSending(true);

    // 사용자 메시지 즉시 표시
    const tempUserMsg: Message = { id: Date.now(), role: 'user', text, time: '방금 전' };
    setSessions((prev) => prev.map((s) =>
      s.id === selectedSessionId
        ? { ...s, messages: [...s.messages, tempUserMsg], updatedAt: '방금 전', preview: text }
        : s
    ));

    try {
      const res = await client.post(`/api/v1/chat/sessions/${selectedSessionId}/messages`, { content: text });
      const userMsg: Message = {
        id: res.data.user_message.id,
        role: 'user',
        text: res.data.user_message.content,
        time: formatDate(res.data.user_message.created_at),
      };
      const aiMsg: Message = {
        id: res.data.ai_message.id,
        role: 'assistant',
        text: res.data.ai_message.content,
        time: formatDate(res.data.ai_message.created_at),
      };
      setSessions((prev) => prev.map((s) => {
        if (s.id !== selectedSessionId) return s;
        // 임시 메시지 교체 후 AI 메시지 추가
        const msgs = s.messages.filter((m) => m.id !== tempUserMsg.id);
        return {
          ...s,
          messages: [...msgs, userMsg, aiMsg],
          messageCount: s.messageCount + 2,
          preview: text,
          updatedAt: '방금 전',
        };
      }));
    } catch (e) {
      console.error('메시지 전송 실패:', e);
      const errMsg: Message = { id: Date.now(), role: 'assistant', text: '오류가 발생했습니다. 다시 시도해주세요.', time: '방금 전' };
      setSessions((prev) => prev.map((s) =>
        s.id === selectedSessionId ? { ...s, messages: [...s.messages, errMsg] } : s
      ));
    } finally {
      setIsSending(false);
    }
  };

  // ── 렌더링 ────────────────────────────────────────────────────────────────

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.preview.toLowerCase().includes(search.toLowerCase())
  );

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;
  const firstUserMessage = selectedSession?.messages.find((m) => m.role === 'user') ?? null;
  const lastUserMessage = [...(selectedSession?.messages ?? [])].reverse().find((m) => m.role === 'user') ?? null;
  const lastAssistantMessage = [...(selectedSession?.messages ?? [])].reverse().find((m) => m.role === 'assistant') ?? null;

  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.18) 0%, rgba(95,117,177,0.06) 24%, transparent 48%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
    }}>
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20">
        <header className="flex h-16 items-center sm:h-[72px] md:h-20">
          <div className="flex w-[48px] items-center justify-start sm:w-[56px]">
            <button onClick={() => navigate(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white sm:h-11 sm:w-11">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 text-center">
            <span className="pointer-events-none text-[16px] font-medium tracking-[0.18em] text-slate-700 sm:text-[18px] md:text-[20px] lg:text-[24px]">CLAIR.</span>
          </div>
          <div className="flex w-[48px] items-center justify-end sm:w-[56px]" />
        </header>

        <main className="flex flex-1 items-center justify-center py-4 sm:py-5 md:py-6">
          <div className="w-full max-w-[980px]">
            <section className="rounded-[18px] border border-white/90 bg-white/65 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[22px] sm:p-5">
              <div className="inline-flex w-fit items-center rounded-full border border-white/90 bg-white/85 px-3 py-1 text-[10px] text-slate-500 sm:px-3.5 sm:text-[11px]">Chat Session Management</div>
              <h1 className="mt-2.5 text-[20px] font-semibold text-slate-900 sm:text-[26px] md:text-[30px]">채팅 세션 관리</h1>
              <p className="mt-2 max-w-[580px] text-[11px] leading-5 text-slate-500 sm:text-[12px] md:text-[13px]">
                채팅 세션 생성, 이력 확인, 메시지 전송, 대화 내역 조회를 한 화면에서 관리할 수 있어요.
              </p>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              {/* 왼쪽: 세션 목록 */}
              <div className="rounded-[18px] border border-white/90 bg-white/92 p-3 shadow-sm sm:rounded-[20px] sm:p-3.5">
                <button type="button" onClick={() => setListOpen((p) => !p)}
                  className="flex w-full items-center justify-between gap-3 text-left lg:hidden">
                  <div>
                    <h2 className="text-[14px] font-semibold text-slate-900">세션 이력</h2>
                    <p className="mt-0.5 text-[10px] text-slate-400">{filteredSessions.length}개 세션</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFF]">
                    <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${listOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <div className={`${listOpen ? 'block' : 'hidden'} mt-3 lg:mt-0 lg:block`}>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                      placeholder="세션 제목이나 내용 검색"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12px] outline-none transition focus:border-[#D8E0F5] sm:text-[13px]" />
                  </div>

                  <div className="mt-3 hidden items-center justify-between lg:flex">
                    <h2 className="text-[14px] font-semibold text-slate-900 sm:text-[15px]">세션 이력</h2>
                    <span className="text-[10px] text-slate-400 sm:text-[11px]">{filteredSessions.length}개 세션</span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {isLoadingSessions ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-[#6C80DD]" />
                      </div>
                    ) : filteredSessions.length > 0 ? (
                      filteredSessions.map((session) => (
                        <SessionListItem key={session.id} session={session}
                          isActive={selectedSessionId === session.id}
                          onClick={() => { setSelectedSessionId(session.id); setDetailOpen(true); }}
                          onDelete={() => { setDeleteTargetId(session.id); setShowDeleteModal(true); }} />
                      ))
                    ) : (
                      <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-400 sm:text-[13px]">
                        {search ? '검색된 채팅 세션이 없어요.' : '아직 채팅 세션이 없어요. 새 세션을 만들어보세요.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 세션 상세 */}
              <div className="rounded-[18px] border border-white/90 bg-white/92 p-3 shadow-sm sm:rounded-[20px] sm:p-3.5">
                {selectedSession ? (
                  <>
                    <button type="button" onClick={() => setDetailOpen((p) => !p)}
                      className="flex w-full items-center justify-between gap-3 text-left lg:hidden">
                      <div>
                        <h2 className="text-[14px] font-semibold text-slate-900">세션 상세</h2>
                        <p className="mt-0.5 text-[10px] text-slate-400">{selectedSession.title}</p>
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFF]">
                        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${detailOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    <div className={`${detailOpen ? 'block' : 'hidden'} mt-3 lg:mt-0 lg:block`}>
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="truncate text-[14px] font-semibold text-slate-900 sm:text-[15px]">{selectedSession.title}</h2>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          </div>
                          <p className="mt-1 text-[10px] text-slate-400 sm:text-[11px]">
                            생성일 {selectedSession.createdAt} · 최근 업데이트 {selectedSession.updatedAt}
                          </p>
                        </div>
                        {selectedSession.messageCount > 0 && (
                          <span className="shrink-0 rounded-full bg-[#EEF2F9] px-2.5 py-1 text-[10px] font-medium text-[#6C80DD]">
                            {selectedSession.messageCount}개
                          </span>
                        )}
                      </div>

                      {/* 세션 메타 정보 */}
                      <div className="mt-3 rounded-[14px] bg-[#F8FAFF] p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">세션 상세</p>
                          <span className="text-[10px] text-slate-400">ID {selectedSession.id}</span>
                        </div>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <InfoCard label="생성일" value={selectedSession.createdAt} />
                          <InfoCard label="최근 수정일" value={selectedSession.updatedAt} />
                          <InfoCard label="총 메시지 수" value={`${selectedSession.messageCount}개`} />
                          <InfoCard label="세션 제목" value={selectedSession.title} />
                        </div>
                        <div className="mt-3 space-y-2">
                          <InfoCard label="첫 질문" value={firstUserMessage?.text ?? '아직 질문이 없어요.'} />
                          <InfoCard label="최근 질문" value={lastUserMessage?.text ?? '아직 질문이 없어요.'} />
                          <InfoCard label="최근 응답" value={lastAssistantMessage?.text ?? '아직 응답이 없어요.'} />
                        </div>
                      </div>

                      {/* 대화 내역 */}
                      <div className="mt-3 rounded-[14px] border border-slate-100 bg-slate-50/70 p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[12px] font-semibold text-slate-900 sm:text-[13px]">대화 내역 조회</h3>
                          <span className="text-[10px] text-slate-400">최신순</span>
                        </div>
                        <div className="mt-3 max-h-[160px] space-y-2.5 overflow-y-auto pr-1 sm:max-h-[190px]">
                          {selectedSession.messages.length === 0 ? (
                            <p className="py-4 text-center text-[11px] text-slate-400">아직 대화 내역이 없어요.</p>
                          ) : (
                            selectedSession.messages.map((message) => (
                              <MessageBubble key={message.id} message={message} />
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>

                      {/* 메시지 전송 */}
                      <div className="mt-3 rounded-[14px] border border-slate-100 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[12px] font-semibold text-slate-900 sm:text-[13px]">메시지 전송</h3>
                          <span className="text-[10px] text-slate-400">Enter로 전송</span>
                        </div>
                        <div className="mt-3 flex items-end gap-2">
                          <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder="메시지를 입력해보세요."
                            disabled={isSending}
                            className="min-h-[72px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] outline-none transition focus:border-[#D8E0F5] disabled:opacity-50"
                          />
                          <button type="button" onClick={handleSendMessage} disabled={isSending}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C80DD] text-white transition hover:opacity-90 disabled:opacity-50">
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 text-center text-[12px] text-slate-400 sm:text-[13px]">
                    {isLoadingSessions ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#6C80DD]" />
                    ) : (
                      '새 세션을 생성해보세요.'
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">채팅 세션을 삭제할까요?</h2>
                <p className="mt-2 text-[13px] leading-6 text-slate-500">삭제하면 해당 대화 내역을 다시 확인할 수 없습니다.</p>
              </div>
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
                className="text-slate-700" aria-label="닫기">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => { setShowDeleteModal(false); setDeleteTargetId(null); }}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-700">취소</button>
              <button type="button" onClick={handleConfirmDeleteSession}
                style={{ backgroundColor: '#EEF2FF', color: '#4C63D2' }}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold shadow-sm transition hover:opacity-90">삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-[11px] font-medium text-slate-700 sm:text-[12px]">{value}</p>
    </div>
  );
}
