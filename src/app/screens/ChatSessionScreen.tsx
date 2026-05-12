import { useMemo, useState } from 'react';
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

const initialSessions: Session[] = [
  {
    id: 1,
    title: '근로계약서 검토 상담',
    createdAt: '2026.04.04',
    updatedAt: '방금 전',
    messageCount: 6,
    preview: '근로계약서의 수습기간 조항이 적절한지 검토해줘.',
    messages: [
      {
        id: 1,
        role: 'user',
        text: '근로계약서의 수습기간 조항이 적절한지 검토해줘.',
        time: '오후 3:10',
      },
      {
        id: 2,
        role: 'assistant',
        text: '수습기간의 길이, 감액 비율, 평가 기준이 함께 명시되어 있는지 확인하는 것이 좋아요.',
        time: '오후 3:11',
      },
      {
        id: 3,
        role: 'user',
        text: '퇴사 통보 조항도 같이 봐줘.',
        time: '오후 3:12',
      },
      {
        id: 4,
        role: 'assistant',
        text: '일방적으로 불리한 통보 기간이 설정되어 있지 않은지 확인해볼게요.',
        time: '오후 3:13',
      },
    ],
  },
  {
    id: 2,
    title: '임대차 계약 상담',
    createdAt: '2026.04.03',
    updatedAt: '1시간 전',
    messageCount: 4,
    preview: '상가 임대차 계약서의 원상복구 조항이 과도한지 궁금해.',
    messages: [
      {
        id: 1,
        role: 'user',
        text: '상가 임대차 계약서의 원상복구 조항이 과도한지 궁금해.',
        time: '오전 11:02',
      },
      {
        id: 2,
        role: 'assistant',
        text: '임차인의 통상적인 사용 범위를 넘는 의무를 지우는지 먼저 확인해봐야 해요.',
        time: '오전 11:03',
      },
    ],
  },
  {
    id: 3,
    title: '프리랜서 계약 문의',
    createdAt: '2026.04.02',
    updatedAt: '어제',
    messageCount: 5,
    preview: '저작권 귀속 조항이 프리랜서에게 너무 불리한 것 같아.',
    messages: [
      {
        id: 1,
        role: 'user',
        text: '저작권 귀속 조항이 프리랜서에게 너무 불리한 것 같아.',
        time: '오후 8:41',
      },
      {
        id: 2,
        role: 'assistant',
        text: '대가 지급 범위와 2차적 저작물 활용 권한까지 함께 봐야 정확히 판단할 수 있어요.',
        time: '오후 8:42',
      },
    ],
  },
];

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

  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [listOpen, setListOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (session) =>
        session.title.toLowerCase().includes(search.toLowerCase()) ||
        session.preview.toLowerCase().includes(search.toLowerCase())
    );
  }, [sessions, search]);

  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ??
    sessions[0] ??
    null;

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

  const handleCreateSession = () => {
    const newSession: Session = {
      id: Date.now(),
      title: `새 채팅 세션 ${sessions.length + 1}`,
      createdAt: '오늘',
      updatedAt: '방금 전',
      messageCount: 0,
      preview: '새로운 상담을 시작해보세요.',
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setSelectedSessionId(newSession.id);
    setDetailOpen(true);
    setMessageInput('');
  };

  const handleOpenDeleteModal = (sessionId: number) => {
    setDeleteTargetId(sessionId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const handleConfirmDeleteSession = () => {
    if (deleteTargetId === null) return;

    const next = sessions.filter((session) => session.id !== deleteTargetId);
    setSessions(next);

    if (selectedSessionId === deleteTargetId) {
      setSelectedSessionId(next[0]?.id ?? 0);
    }

    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const handleSelectSession = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setDetailOpen(true);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedSession) return;

    const nextText = messageInput.trim();

    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== selectedSession.id) return session;

        const userMessage: Message = {
          id: Date.now(),
          role: 'user',
          text: nextText,
          time: '방금 전',
        };

        const assistantMessage: Message = {
          id: Date.now() + 1,
          role: 'assistant',
          text: '메시지가 전송되었어요. 이 영역에 실제 챗봇 응답을 연결하면 됩니다.',
          time: '방금 전',
        };

        return {
          ...session,
          updatedAt: '방금 전',
          preview: nextText,
          messageCount: session.messageCount + 2,
          messages: [...session.messages, userMessage, assistantMessage],
        };
      })
    );

    setMessageInput('');
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
                  className="flex w-full items-center justify-between gap-3 text-left lg:hidden"
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

                <div
                  className={`${listOpen ? 'block' : 'hidden'} mt-3 lg:mt-0 lg:block`}
                >
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
                    {filteredSessions.map((session) => (
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
                            placeholder="이 세션에 메시지를 입력해보세요."
                            className="min-h-[72px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] outline-none transition focus:border-[#D8E0F5]"
                          />

                          <button
                            type="button"
                            onClick={handleSendMessage}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C80DD] text-white transition hover:opacity-90"
                          >
                            <Send className="h-4 w-4" />
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