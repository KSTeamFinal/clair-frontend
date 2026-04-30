import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Upload,
  Search,
  Trash2,
  BarChart3,
  Eye,
  Clock3,
  FileUp,
} from 'lucide-react';

type ContractStatus = '업로드 완료' | '분석 대기' | '분석 완료' | '삭제됨';

type Contract = {
  id: number;
  title: string;
  category: string;
  uploadedAt: string;
  updatedAt: string;
  status: ContractStatus;
  fileName: string;
  size: string;
  summary: string;
  deletedAt?: string;
};

const initialContracts: Contract[] = [
  {
    id: 1,
    title: '근로계약서_정규직',
    category: '근로계약',
    uploadedAt: '2026.04.05',
    updatedAt: '방금 전',
    status: '분석 완료',
    fileName: 'employment_contract.pdf',
    size: '1.8MB',
    summary: '수습기간, 연장근로수당, 퇴사 통보 조항에 대한 검토가 필요한 계약서예요.',
  },
  {
    id: 2,
    title: '상가임대차계약서',
    category: '임대차계약',
    uploadedAt: '2026.04.04',
    updatedAt: '2시간 전',
    status: '분석 대기',
    fileName: 'lease_store.pdf',
    size: '2.3MB',
    summary: '원상복구 조항, 관리비 부담, 중도해지 조건을 중심으로 확인 중이에요.',
  },
  {
    id: 3,
    title: '프리랜서_용역계약서',
    category: '용역계약',
    uploadedAt: '2026.04.03',
    updatedAt: '어제',
    status: '업로드 완료',
    fileName: 'freelance_service_contract.pdf',
    size: '1.2MB',
    summary: '저작권 귀속, 수정 요청 범위, 대금 지급 시점이 중요한 계약서예요.',
  },
  {
    id: 4,
    title: '삭제된_비밀유지계약서',
    category: 'NDA',
    uploadedAt: '2026.04.01',
    updatedAt: '2026.04.02',
    status: '삭제됨',
    fileName: 'nda_deleted.pdf',
    size: '980KB',
    summary: '삭제 이력 확인용 샘플 계약서예요.',
    deletedAt: '2026.04.04',
  },
];

function SectionCard({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[15px] border border-white/90 bg-white/92 p-2.5 shadow-sm sm:rounded-[17px] sm:p-3 md:rounded-[18px] md:p-3.5 lg:rounded-[20px] lg:p-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-slate-900 sm:text-[14px] md:text-[15px]">
            {title}
          </h2>
          <p className="mt-0.5 text-[10px] text-slate-400 sm:text-[11px]">
            {subtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full bg-[#EEF2F9] px-2 py-0.5 text-[9px] font-medium text-[#6C80DD] sm:px-2.5 sm:py-1 sm:text-[10px]">
            {open ? '닫기' : '열기'}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8FAFF]">
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform ${
                open ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </button>

      {open && <div className="mt-3 sm:mt-4">{children}</div>}
    </section>
  );
}

function ContractListItem({
  contract,
  isActive,
  onClick,
  onDelete,
}: {
  contract: Contract;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const statusStyle =
    contract.status === '분석 완료'
      ? 'bg-emerald-50 text-emerald-600'
      : contract.status === '분석 대기'
      ? 'bg-amber-50 text-amber-600'
      : contract.status === '삭제됨'
      ? 'bg-rose-50 text-rose-500'
      : 'bg-[#EEF2F9] text-[#6C80DD]';

  return (
    <div
      className={`rounded-[13px] border p-2.5 transition sm:rounded-[15px] sm:p-3 ${
        isActive
          ? 'border-[#D7E1FB] bg-[#F8FAFF]'
          : 'border-white/90 bg-white/88 hover:bg-white'
      }`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onClick}
          className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
        >
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEF2F9] sm:h-9 sm:w-9">
            <FileText className="h-[14px] w-[14px] text-[#6C80DD] sm:h-[15px] sm:w-[15px]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate text-[11px] font-semibold text-slate-900 sm:text-[12px] md:text-[13px]">
                {contract.title}
              </h3>
              <span className="shrink-0 text-[10px] text-slate-400">
                {contract.updatedAt}
              </span>
            </div>

            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-[11px]">
              {contract.summary}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2F9] px-2 py-0.5 text-[#6C80DD]">
                <Clock3 className="h-3 w-3" />
                {contract.uploadedAt}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                {contract.category}
              </span>
              <span className={`rounded-full px-2 py-0.5 font-medium ${statusStyle}`}>
                {contract.status}
              </span>
            </div>
          </div>
        </button>

        {contract.status !== '삭제됨' && (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
            aria-label="계약서 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ContractManagementScreen() {
  const navigate = useNavigate();

  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [selectedContractId, setSelectedContractId] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(true);
  const [listOpen, setListOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(true);
  const [deleteHistoryOpen, setDeleteHistoryOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [analysisNote, setAnalysisNote] = useState('');

  const visibleContracts = useMemo(() => {
    return contracts.filter(
      (contract) =>
        contract.status !== '삭제됨' &&
        (contract.title.toLowerCase().includes(search.toLowerCase()) ||
          contract.category.toLowerCase().includes(search.toLowerCase()) ||
          contract.fileName.toLowerCase().includes(search.toLowerCase()))
    );
  }, [contracts, search]);

  const deletedContracts = useMemo(() => {
    return contracts.filter((contract) => contract.status === '삭제됨');
  }, [contracts]);

  const selectedContract =
    contracts.find((contract) => contract.id === selectedContractId) ??
    visibleContracts[0] ??
    null;

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
  };

  const handleUpload = () => {
    if (!selectedFileName) return;

    const newContract: Contract = {
      id: Date.now(),
      title: selectedFileName.replace(/\.[^/.]+$/, ''),
      category: '기타계약',
      uploadedAt: '오늘',
      updatedAt: '방금 전',
      status: '업로드 완료',
      fileName: selectedFileName,
      size: '업로드 파일',
      summary: '새로 업로드된 계약서예요. 상세 내용을 확인하거나 분석 요청을 진행할 수 있어요.',
    };

    setContracts((prev) => [newContract, ...prev]);
    setSelectedContractId(newContract.id);
    setSelectedFileName('');
    setUploadOpen(true);
    setListOpen(true);
    setDetailOpen(true);
  };

  const handleDeleteContract = (contractId: number) => {
    const updatedContracts = contracts.map((contract) =>
      contract.id === contractId
        ? {
            ...contract,
            status: '삭제됨' as ContractStatus,
            updatedAt: '방금 전',
            deletedAt: '오늘',
          }
        : contract
    );

    setContracts(updatedContracts);

    const remaining = updatedContracts.filter(
      (contract) => contract.id !== contractId && contract.status !== '삭제됨'
    );
    setSelectedContractId(remaining[0]?.id ?? 0);
  };

  const handleAnalyze = () => {
    if (!selectedContract || selectedContract.status === '삭제됨') return;

    setContracts((prev) =>
      prev.map((contract) =>
        contract.id === selectedContract.id
          ? {
              ...contract,
              status: '분석 완료',
              updatedAt: '방금 전',
              summary:
                analysisNote.trim() ||
                '독소조항, 책임 범위, 해지 조항, 대금 지급 조건을 중심으로 분석 요청이 완료되었어요.',
            }
          : contract
      )
    );

    setAnalysisNote('');
    setAnalysisOpen(true);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.18) 0%, rgba(95,117,177,0.06) 24%, transparent 48%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-2.5 sm:px-3 md:px-4 lg:px-12 xl:px-20">
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
          <div className="mx-auto w-full max-w-[920px]">
            <section className="rounded-[16px] border border-white/90 bg-white/65 p-3 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[18px] sm:p-3.5 md:p-4 lg:rounded-[22px] lg:p-5">
              <div className="max-w-[760px]">
                <div className="inline-flex w-fit items-center rounded-full border border-white/90 bg-white/85 px-3 py-1 text-[10px] text-slate-500 sm:px-3.5 sm:text-[11px]">
                  Contract Management
                </div>

                <div className="mt-2.5 flex items-center gap-2.5 sm:gap-3">
                  <h1 className="text-[20px] font-semibold leading-[1.15] text-slate-900 sm:text-[24px] md:text-[28px] lg:text-[30px]">
                    계약서 관리
                  </h1>
                </div>

                <p className="mt-2 max-w-[620px] text-[11px] leading-5 text-slate-500 sm:text-[12px] md:text-[13px]">
                  계약서 업로드, 목록 조회, 삭제 이력 조회, 상세 조회, 삭제, 분석 요청을 한 화면에서 관리할 수 있어요.
                </p>
              </div>
            </section>

            <div className="mt-3.5 grid gap-3.5 sm:mt-4 sm:gap-4">
              <SectionCard
                title="계약서 업로드"
                subtitle="PDF 또는 문서 파일 업로드"
                open={uploadOpen}
                onToggle={() => setUploadOpen((prev) => !prev)}
              >
                <div className="mx-auto w-full max-w-[900px] rounded-[14px] border border-dashed border-[#D7E1FB] bg-[#F8FAFF] p-2.5 sm:p-3 md:p-3.5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white sm:h-10 sm:w-10">
                        <Upload className="h-4 w-4 text-[#6C80DD] sm:h-5 sm:w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-slate-900 sm:text-[14px]">
                          새 계약서 업로드
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-[12px]">
                          업로드 후 목록 조회, 상세 확인, 삭제, 분석 요청까지 바로 이어서 진행할 수 있어요.
                        </p>
                      </div>
                    </div>

                    <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#5B72D6] bg-[#6C80DD] px-3 text-[11px] font-semibold text-white shadow-md transition hover:opacity-90 sm:h-11 sm:w-auto sm:px-4 sm:text-[12px]">
                      <FileUp className="h-4 w-4" />
                      파일 선택
                      <input type="file" className="hidden" onChange={handleSelectFile} />
                    </label>
                  </div>

                  <div className="mt-3 rounded-xl bg-white p-3">
                    <p className="text-[10px] text-slate-400">선택된 파일</p>
                    <p className="mt-1 break-all text-[12px] font-medium text-slate-700">
                      {selectedFileName || '아직 선택된 파일이 없어요.'}
                    </p>

                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={!selectedFileName}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#6C80DD] px-4 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      업로드 실행
                    </button>
                  </div>
                </div>
              </SectionCard>

              <div className="mx-auto grid w-full max-w-[920px] gap-3 lg:grid-cols-[0.92fr_1.08fr] lg:gap-4">
                <SectionCard
                  title="계약서 목록 조회"
                  subtitle={`${visibleContracts.length}개 계약서`}
                  open={listOpen}
                  onToggle={() => setListOpen((prev) => !prev)}
                >
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="계약서명, 파일명, 카테고리 검색"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[12px] outline-none transition focus:border-[#D8E0F5] sm:text-[13px]"
                    />
                  </div>

                  <div className="mt-3 space-y-2.5">
                    {visibleContracts.map((contract) => (
                      <ContractListItem
                        key={contract.id}
                        contract={contract}
                        isActive={selectedContractId === contract.id}
                        onClick={() => setSelectedContractId(contract.id)}
                        onDelete={() => handleDeleteContract(contract.id)}
                      />
                    ))}

                    {visibleContracts.length === 0 && (
                      <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-400 sm:text-[13px]">
                        조회되는 계약서가 없어요.
                      </div>
                    )}
                  </div>
                </SectionCard>

                <SectionCard
                  title="계약서 상세 조회"
                  subtitle="선택한 계약서 상세 정보"
                  open={detailOpen}
                  onToggle={() => setDetailOpen((prev) => !prev)}
                >
                  {selectedContract ? (
                    <>
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="truncate text-[13px] font-semibold text-slate-900 sm:text-[15px]">
                              {selectedContract.title}
                            </h2>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                          </div>
                          <p className="mt-1 text-[10px] text-slate-400 sm:text-[11px]">
                            업로드일 {selectedContract.uploadedAt} · 최근 업데이트 {selectedContract.updatedAt}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#EEF2F9] px-2.5 py-1 text-[10px] font-medium text-[#6C80DD]">
                          {selectedContract.status}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 lg:grid-cols-2">
                        <div className="rounded-xl bg-[#F8FAFF] px-3 py-2">
                          <p className="text-[10px] text-slate-400">파일명</p>
                          <p className="mt-1 break-all text-[11px] font-medium text-slate-700 sm:text-[12px]">
                            {selectedContract.fileName}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#F8FAFF] px-3 py-2">
                          <p className="text-[10px] text-slate-400">파일 크기</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-700 sm:text-[12px]">
                            {selectedContract.size}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#F8FAFF] px-3 py-2">
                          <p className="text-[10px] text-slate-400">계약 종류</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-700 sm:text-[12px]">
                            {selectedContract.category}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#F8FAFF] px-3 py-2">
                          <p className="text-[10px] text-slate-400">상태</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-700 sm:text-[12px]">
                            {selectedContract.status}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-xl bg-white px-3 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-[#6C80DD]" />
                          <p className="text-[11px] font-medium text-slate-500 sm:text-[12px]">
                            계약서 요약
                          </p>
                        </div>
                        <p className="mt-2 text-[11px] leading-5 text-slate-700 sm:text-[12px]">
                          {selectedContract.summary}
                        </p>
                      </div>

                      {selectedContract.status !== '삭제됨' && (
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                          <button
                            type="button"
                            onClick={handleAnalyze}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#6C80DD] px-4 text-[12px] font-semibold text-white transition hover:opacity-90 sm:w-auto"
                          >
                            <BarChart3 className="h-4 w-4" />
                            분석 요청
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteContract(selectedContract.id)}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-[12px] font-medium text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 sm:w-auto"
                          >
                            <Trash2 className="h-4 w-4" />
                            계약서 삭제
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex min-h-[220px] items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 text-center text-[12px] text-slate-400 sm:text-[13px]">
                      표시할 계약서가 없어요.
                    </div>
                  )}
                </SectionCard>
              </div>

              <SectionCard
                title="계약서 분석 요청"
                subtitle="선택한 계약서에 분석 요청 보내기"
                open={analysisOpen}
                onToggle={() => setAnalysisOpen((prev) => !prev)}
              >
                <div className="mx-auto w-full max-w-[900px] rounded-[16px] border border-slate-100 bg-white p-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#6C80DD]" />
                    <p className="text-[12px] font-semibold text-slate-900 sm:text-[13px]">
                      분석 메모
                    </p>
                  </div>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-[12px]">
                    독소조항, 해지 조항, 책임 범위, 손해배상, 대금 지급 조건 등 확인이 필요한 내용을 적어둘 수 있어요.
                  </p>

                  <textarea
                    value={analysisNote}
                    onChange={(e) => setAnalysisNote(e.target.value)}
                    placeholder="예: 해지 조항과 위약금 조항이 과도한지 분석해줘."
                    className="mt-3 min-h-[92px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[12px] outline-none transition focus:border-[#D8E0F5]"
                  />

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!selectedContract || selectedContract.status === '삭제됨'}
                    className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#6C80DD] px-4 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    분석 요청 실행
                  </button>
                </div>
              </SectionCard>

              <SectionCard
                title="계약서 삭제 이력 조회"
                subtitle={`${deletedContracts.length}개 삭제 기록`}
                open={deleteHistoryOpen}
                onToggle={() => setDeleteHistoryOpen((prev) => !prev)}
              >
                <div className="mx-auto w-full max-w-[900px] space-y-2.5">
                  {deletedContracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="rounded-[14px] border border-slate-100 bg-white p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50">
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[12px] font-semibold text-slate-900 sm:text-[13px]">
                              {contract.title}
                            </h3>
                            <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-500">
                              삭제됨
                            </span>
                          </div>

                          <p className="mt-1 break-all text-[11px] text-slate-500 sm:text-[12px]">
                            파일명 {contract.fileName}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400 sm:text-[11px]">
                            업로드일 {contract.uploadedAt} · 삭제일 {contract.deletedAt ?? '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {deletedContracts.length === 0 && (
                    <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-400 sm:text-[13px]">
                      삭제된 계약서 이력이 없어요.
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}