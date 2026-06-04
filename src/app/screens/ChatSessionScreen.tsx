import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  MessageCircle,
  Plus,
  Search,
  Send,
  Trash2,
  Clock3,
  ChevronRight,
  ChevronDown,
  X,
} from 'lucide-react';

import client from '../../api/client';

type RawMessage = {
  id?: number;
  sender?: 'USER' | 'AI' | 'user' | 'assistant' | string;
  role?: 'user' | 'assistant' | string;
  content?: string;
  message?: string;
  text?: string;
  created_at?: string;
  createdAt?: string;
};

type RawSession = {
  id: number;
  contract_id?: number | null;
  title?: string;
  total_message_count?: number;
  message_count?: number;
  messageCount?: number;
  last_message_at?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  preview?: string;
  last_message?: string;
  first_question?: string | null;
  last_question?: string | null;
  last_answer?: string | null;
  messages?: RawMessage[];
};

type RawSessionListResponse = {
  total?: number;
  sessions?: RawSession[];
};

type RawMessagesListResponse = {
  session_id?: number;
  total?: number;
  messages?: RawMessage[];
};

type Message = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  time: string;
};

type Session = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
  messages: Message[];
};

const FALLBACK_AI_ANSWER =
  '이 질문은 현재 선택된 계약서 정보만으로는 정확히 답변하기 어려워요. 계약서 원문이나 관련 조항을 조금 더 구체적으로 입력해주시면, 해당 내용을 기준으로 다시 검토해드릴게요.';

const formatDate = (value?: string | null) => {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatTime = (value?: string | null) => {
  if (!value) return '방금 전';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeMessage = (message: RawMessage, index: number): Message => {
  const sender = String(message.sender ?? message.role ?? '').toLowerCase();
  const rawContent = message.content ?? message.message ?? message.text ?? '';

  const isAssistant =
    sender === 'ai' ||
    sender === 'assistant' ||
    sender === 'bot' ||
    sender === 'system' ||
    sender === 'clair' ||
    sender === 'clair_ai' ||
    sender === 'claude' ||
    sender.includes('ai') ||
    sender.includes('assistant') ||
    rawContent.includes('계약서를 업로드하거나 질문을 입력해주세요.');

  const isWeakAiAnswer =
    isAssistant &&
    (!rawContent.trim() ||
      rawContent.includes('답변할 수 없습니다') ||
      rawContent.includes('알 수 없습니다') ||
      rawContent.includes('정보가 없습니다') ||
      rawContent.includes('확인할 수 없습니다'));

  return {
    id: message.id ?? Date.now() + index,
    role: isAssistant ? 'assistant' : 'user',
    text: isWeakAiAnswer ? FALLBACK_AI_ANSWER : rawContent,
    time: formatTime(message.created_at ?? message.createdAt),
  };
};

const normalizeSession = (session: RawSession): Session => {
  const messages = (session.messages ?? []).map(normalizeMessage);
  const lastMessage = messages[messages.length - 1];

  return {
    id: session.id,
    title: session.title ?? `채팅 세션 ${session.id}`,
    createdAt: formatDate(session.created_at ?? session.createdAt),
    updatedAt: formatDate(
      session.last_message_at ?? session.updated_at ?? session.updatedAt
    ),
    messageCount:
      session.total_message_count ??
      session.message_count ??
      session.messageCount ??
      messages.length ??
      0,
    preview:
      session.preview ??
      session.last_question ??
      session.first_question ??
      session.last_message ??
      lastMessage?.text ??
      '새로운 상담을 시작해보세요.',
    messages,
  };
};

function SessionListItem({
  session,
  isActive,
  onClick,
  onDelete,
}: {
  session: Session;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`rounded-[14px] border p-2.5 transition sm:rounded-[16px] sm:p-3 ${
        isActive
          ? 'border-[#D7E1FB] bg-[#F8FAFF]'
          : 'border-white/90 bg-white/88 hover:bg-white'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F9]">
            <MessageCircle className="h-[13px] w-[13px] text-[#6C80DD]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-[12px] font-semibold text-slate-900 sm:text-[13px]">
                {session.title}
              </h3>
              <span className="shrink-0 text-[10px] text-slate-400">
                {session.updatedAt}
              </span>
            </div>

            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-[11px]">
              {session.preview}
            </p>

            <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2F9] px-2 py-0.5 text-[#6C80DD]">
                <Clock3 className="h-3 w-3" />
                {session.createdAt}
              </span>
              <span>{session.messageCount}개</span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:text-rose-500"
        >
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
      <div
        className={`max-w-[88%] rounded-[16px] px-3 py-2 sm:max-w-[78%] ${
          isUser
            ? 'bg-[#6C80DD] text-white'
            : 'border border-slate-200 bg-white text-slate-700'
        }`}
      >
        <p
          className={`mb-1 text-[10px] font-semibold ${
            isUser ? 'text-white/80' : 'text-[#6C80DD]'
          }`}
        >
          {isUser ? '나' : 'CLAIR AI'}
        </p>

        <p className="text-[11px] leading-5 sm:text-[12px]">{message.text}</p>

        <p
          className={`mt-1 text-[10px] ${
            isUser ? 'text-white/75' : 'text-slate-400'
          }`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

export default function ChatSessionScreen() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [answerStatus, setAnswerStatus] = useState<
    'idle' | 'thinking' | 'done'
  >('idle');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await client.get<RawSessionListResponse | RawSession[]>(
        '/api/v1/chat/sessions'
      );

      const rawSessions = Array.isArray(res.data)
        ? res.data
        : res.data.sessions ?? [];

      const normalizedSessions = rawSessions.map(normalizeSession);

      setSessions((prev) => {
        const selectedDetail = prev.find(
          (session) =>
            session.id === selectedSessionId && session.messages.length > 0
        );

        if (!selectedDetail) return normalizedSessions;

        return normalizedSessions.map((session) =>
          session.id === selectedDetail.id
            ? {
                ...session,
                messages: selectedDetail.messages,
              }
            : session
        );
      });

      if (normalizedSessions.length > 0 && selectedSessionId === 0) {
        setSelectedSessionId(normalizedSessions[0].id);
      }
    } catch (error) {
      console.error('채팅 세션 목록 조회 실패:', error);
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (session) =>
        session.title.toLowerCase().includes(search.toLowerCase()) ||
        session.preview.toLowerCase().includes(search.toLowerCase())
    );
  }, [sessions, search]);

  const visibleSessions = listOpen
    ? filteredSessions
    : filteredSessions.slice(0, 5);

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ??
    sessions[0] ??
    null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [selectedSession?.messages.length, isSending, answerStatus]);

  const firstUserMessage =
    selectedSession?.messages.find((message) => message.role === 'user') ?? null;

  const lastUserMessage =
    [...(selectedSession?.messages ?? [])]
      .reverse()
      .find((message) => message.role === 'user') ?? null;

  const lastAssistantMessage =
    [...(selectedSession?.messages ?? [])]
      .reverse()
      .find((message) => message.role === 'assistant') ?? null;

  const refreshSelectedSession = async (sessionId: number) => {
    const sessionRes = await client.get<RawSession>(
      `/api/v1/chat/sessions/${sessionId}`
    );

    const messageRes = await client.get<RawMessagesListResponse | RawMessage[]>(
      `/api/v1/chat/sessions/${sessionId}/messages`
    );

    const rawMessages = Array.isArray(messageRes.data)
      ? messageRes.data
      : messageRes.data.messages ?? [];

    const updatedSession = normalizeSession({
      ...sessionRes.data,
      messages: rawMessages,
    });

    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? updatedSession : session
      )
    );

    setSelectedSessionId(sessionId);
    setDetailOpen(true);
  };

  const handleCreateSession = async () => {
    try {
      const res = await client.post('/api/v1/chat/sessions', {
        contract_id: null,
        title: `새 채팅 세션 ${sessions.length + 1}`,
      });

      const newSession = normalizeSession(res.data);

      setSessions((prev) => [newSession, ...prev]);
      setSelectedSessionId(newSession.id);
      setDetailOpen(true);
      setMessageInput('');
      setAnswerStatus('idle');
    } catch (error) {
      console.error('채팅 세션 생성 실패:', error);
    }
  };

  const handleOpenDeleteModal = (sessionId: number) => {
    setDeleteTargetId(sessionId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const handleConfirmDeleteSession = async () => {
    if (deleteTargetId === null) return;

    try {
      await client.delete(`/api/v1/chat/sessions/${deleteTargetId}`);

      const next = sessions.filter((session) => session.id !== deleteTargetId);

      setSessions(next);

      if (selectedSessionId === deleteTargetId) {
        setSelectedSessionId(next[0]?.id ?? 0);
      }

      setShowDeleteModal(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('채팅 세션 삭제 실패:', error);
    }
  };

  const handleSelectSession = async (sessionId: number) => {
    try {
      await refreshSelectedSession(sessionId);
      setAnswerStatus('idle');
    } catch (error) {
      console.error('채팅 세션 상세 조회 실패:', error);
      setSelectedSessionId(sessionId);
      setDetailOpen(true);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedSession || isSending) return;

    const currentSessionId = selectedSession.id;
    const nextText = messageInput.trim();

    setMessageInput('');
    setIsSending(true);
    setAnswerStatus('thinking');

    const optimisticUserMessage: Message = {
      id: Date.now(),
      role: 'user',
      text: nextText,
      time: '방금 전',
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              preview: nextText,
              messageCount: session.messageCount + 1,
              messages: [...session.messages, optimisticUserMessage],
            }
          : session
      )
    );

    try {
      await client.post(`/api/v1/chat/sessions/${currentSessionId}/messages`, {
        content: nextText,
        message_type: 'question',
      }, { timeout: 120000 });

      await refreshSelectedSession(currentSessionId);

      setAnswerStatus('done');

      setTimeout(() => {
        setAnswerStatus('idle');
      }, 1800);
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      setAnswerStatus('idle');
    } finally {
      setIsSending(false);
    }
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
          <div className="flex w-[48px] items-center justify-start sm:w-[56px]">
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

          <div className="flex w-[48px] items-center justify-end sm:w-[56px]" />
        </header>

        <main className="flex flex-1 items-center justify-center py-4 sm:py-5 md:py-6">
          <div className="w-full max-w-[980px]">
            <section className="rounded-[18px] border border-white/90 bg-white/65 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[22px] sm:p-5">
              <div className="inline-flex w-fit items-center rounded-full border border-white/90 bg-white/85 px-3 py-1 text-[10px] text-slate-500 sm:px-3.5 sm:text-[11px]">
                Chat Session Management
              </div>

              <div className="mt-2.5 flex items-center gap-2.5 sm:gap-3">
                <h1 className="text-[20px] font-semibold leading-[1.15] text-slate-900 sm:text-[26px] md:text-[30px]">
                  채팅 세션 관리
                </h1>
              </div>

              <p className="mt-2 max-w-[580px] text-[11px] leading-5 text-slate-500 sm:text-[12px] md:text-[13px]">
                채팅 세션 생성, 이력 확인, 상세 확인, 메시지 전송, 대화 내역 조회를 한 화면에서 관리할 수 있어요.
              </p>
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[18px] border border-white/90 bg-white/92 p-3 shadow-sm sm:rounded-[20px] sm:p-3.5">
                <button
                  type="button"
                  onClick={() => setListOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <h2 className="text-[14px] font-semibold text-slate-900">
                      세션 이력
                    </h2>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {filteredSessions.length}개 세션
                    </p>
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFF]">
                    <ChevronDown
                      className={`h-4 w-4 text-slate-500 transition-transform ${
                        listOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleCreateSession}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#5B72D6] bg-[#6C80DD] px-4 text-[12px] font-semibold text-white shadow-md transition hover:opacity-90 sm:w-auto sm:min-w-[108px] sm:text-[13px]"
                    style={{ backgroundColor: '#6C80DD', color: '#FFFFFF' }}
                  >
                    <Plus className="h-4 w-4 text-white" strokeWidth={2.4} />
                    <span className="text-white">새 세션</span>
                  </button>

                  <div className="relative mt-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="세션 제목이나 내용 검색"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12px] outline-none transition focus:border-[#D8E0F5] sm:text-[13px]"
                    />
                  </div>

                  <div className="mt-3 hidden items-center justify-between lg:flex">
                    <h2 className="text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                      세션 이력
                    </h2>
                    <span className="text-[10px] text-slate-400 sm:text-[11px]">
                      {filteredSessions.length}개 세션
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {visibleSessions.map((session) => (
                      <SessionListItem
                        key={session.id}
                        session={session}
                        isActive={selectedSessionId === session.id}
                        onClick={() => handleSelectSession(session.id)}
                        onDelete={() => handleOpenDeleteModal(session.id)}
                      />
                    ))}

                    {filteredSessions.length === 0 && (
                      <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-400 sm:text-[13px]">
                        검색된 채팅 세션이 없어요.
                      </div>
                    )}

                    {filteredSessions.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setListOpen((prev) => !prev)}
                        className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 text-[11px] font-medium text-slate-500 transition hover:bg-[#F8FAFF]"
                      >
                        {listOpen
                          ? '세션 접기'
                          : `전체 ${filteredSessions.length}개 보기`}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            listOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-[18px] border border-white/90 bg-white/92 p-3 shadow-sm sm:rounded-[20px] sm:p-3.5">
                {selectedSession ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDetailOpen((prev) => !prev)}
                      className="flex w-full items-center justify-between gap-3 text-left lg:hidden"
                    >
                      <div>
                        <h2 className="text-[14px] font-semibold text-slate-900">
                          세션 상세
                        </h2>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {selectedSession.title}
                        </p>
                      </div>

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFF]">
                        <ChevronDown
                          className={`h-4 w-4 text-slate-500 transition-transform ${
                            detailOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className={`${detailOpen ? 'block' : 'hidden'} mt-3 lg:mt-0 lg:block`}
                    >
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="truncate text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                              {selectedSession.title}
                            </h2>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          </div>

                          <p className="mt-1 text-[10px] text-slate-400 sm:text-[11px]">
                            생성일 {selectedSession.createdAt} · 최근 업데이트{' '}
                            {selectedSession.updatedAt}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#EEF2F9] px-2.5 py-1 text-[10px] font-medium text-[#6C80DD]">
                          {selectedSession.messageCount}개
                        </span>
                      </div>

                      <div className="mt-3 rounded-[14px] bg-[#F8FAFF] p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-medium text-slate-400 sm:text-[11px]">
                            세션 상세
                          </p>
                          <span className="text-[10px] text-slate-400">
                            ID {selectedSession.id}
                          </span>
                        </div>

                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[10px] text-slate-400">생성일</p>
                            <p className="mt-1 text-[11px] font-medium text-slate-700 sm:text-[12px]">
                              {selectedSession.createdAt}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[10px] text-slate-400">최근 수정일</p>
                            <p className="mt-1 text-[11px] font-medium text-slate-700 sm:text-[12px]">
                              {selectedSession.updatedAt}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[10px] text-slate-400">총 메시지 수</p>
                            <p className="mt-1 text-[11px] font-medium text-slate-700 sm:text-[12px]">
                              {selectedSession.messageCount}개
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[10px] text-slate-400">세션 제목</p>
                            <p className="mt-1 truncate text-[11px] font-medium text-slate-700 sm:text-[12px]">
                              {selectedSession.title}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[10px] text-slate-400">첫 질문</p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-700 sm:text-[12px]">
                              {firstUserMessage?.text ?? '아직 질문이 없어요.'}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[10px] text-slate-400">최근 질문</p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-700 sm:text-[12px]">
                              {lastUserMessage?.text ?? '아직 질문이 없어요.'}
                            </p>
                          </div>

                          <div className="rounded-xl bg-white px-3 py-2">
                            <p className="text-[10px] text-slate-400">최근 응답</p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-700 sm:text-[12px]">
                              {lastAssistantMessage?.text ?? '아직 응답이 없어요.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 rounded-[14px] border border-slate-100 bg-slate-50/70 p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[12px] font-semibold text-slate-900 sm:text-[13px]">
                            대화 내역 조회
                          </h3>
                          <span className="text-[10px] text-slate-400">
                            최신순 반영
                          </span>
                        </div>

                        <div className="mt-3 max-h-[160px] space-y-2.5 overflow-y-auto pr-1 sm:max-h-[190px]">
                          {selectedSession.messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                          ))}

                          {isSending && (
                            <div className="flex justify-start">
                              <div className="max-w-[78%] rounded-[16px] border border-slate-200 bg-white px-3 py-2 text-slate-700">
                                <p className="mb-1 text-[10px] font-semibold text-[#6C80DD]">
                                  CLAIR AI
                                </p>
                                <p className="text-[11px] leading-5 sm:text-[12px]">
                                  답변을 작성 중이에요...
                                </p>
                                <p className="mt-1 text-[10px] text-slate-400">
                                  잠시만 기다려주세요
                                </p>
                              </div>
                            </div>
                          )}

                          {answerStatus === 'done' && (
                            <div className="text-center text-[10px] text-slate-400">
                              답변 완료
                            </div>
                          )}

                          {selectedSession.messages.length === 0 && !isSending && (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-[12px] text-slate-400">
                              아직 대화 내역이 없어요.
                            </div>
                          )}

                          <div ref={messagesEndRef} />
                        </div>
                      </div>

                      <div className="mt-3 rounded-[14px] border border-slate-100 bg-white p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[12px] font-semibold text-slate-900 sm:text-[13px]">
                            메시지 전송
                          </h3>
                          <span className="text-[10px] text-slate-400">
                            Enter로 전송 가능
                          </span>
                        </div>

                        <div className="mt-3 flex flex-col gap-2">
                          <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            placeholder={
                              isSending
                                ? 'AI가 답변을 작성 중이에요.'
                                : '이 세션에 메시지를 입력해보세요.'
                            }
                            disabled={isSending}
                            className="min-h-[72px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] outline-none transition focus:border-[#D8E0F5] disabled:cursor-not-allowed disabled:bg-slate-50"
                          />

                          <button
                            type="button"
                            onClick={handleSendMessage}
                            disabled={isSending || !messageInput.trim()}
                            style={{
                              backgroundColor:
                                isSending || !messageInput.trim()
                                  ? '#D8E0F5'
                                  : '#6C80DD',
                              color: '#FFFFFF',
                            }}
                            className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl px-4 text-[12px] font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed"
                          >
                            <Send className="h-4 w-4 text-white" />
                            <span className="text-white">
                              {isSending ? '답변 작성 중' : '전송'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 text-center text-[12px] text-slate-400 sm:text-[13px]">
                    표시할 채팅 세션이 없어요. 새 세션을 생성해보세요.
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">
                  채팅 세션을 삭제할까요?
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-slate-500">
                  삭제하면 해당 대화 내역을 다시 확인할 수 없습니다.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="text-slate-700"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleCloseDeleteModal}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-[13px] font-semibold text-slate-700"
              >
                취소
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteSession}
                style={{
                  backgroundColor: '#EEF2FF',
                  color: '#4C63D2',
                }}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold shadow-sm transition hover:opacity-90"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}