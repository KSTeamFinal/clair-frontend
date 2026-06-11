import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Search,
  Trash2,
  Eye,
  Clock3,
  X,
} from 'lucide-react';

type ContractStatus =
  | '업로드 완료'
  | '분석 대기'
  | '분석 중'
  | '분석 완료'
  | '분석 실패'
  | '삭제됨';

type Contract = {
  id: number;
  title: string;
  category: string;
  uploadedAt: string;
  updatedAt: string;
  sortTime: number;
  status: ContractStatus;
  fileName: string;
  size: string;
  summary: string;
  deletedAt?: string;
};

type RawContract = {
  id?: number;
  contract_id?: number;
  contractId?: number;
  contract?: RawContract;
  data?: RawContract;
  analysis?: {
    summary?: string;
    status?: string;
    safety_score?: number;
    created_at?: string;
  };
  title?: string;
  name?: string;
  file_name?: string;
  filename?: string;
  original_filename?: string;
  category?: string;
  contract_type?: string;
  uploaded_at?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  analysis_status?: string;
  file_size?: number;
  size?: number | string;
  summary?: string;
  analysis_summary?: string;
  deleted_at?: string;
};

type DeletedContractPayload = {
  deleted_contracts?: RawContract[];
  deletedContracts?: RawContract[];
  history?: RawContract[];
  contracts?: RawContract[];
  items?: RawContract[];
  data?: RawContract[];
};

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
      : contract.status === '분석 대기' || contract.status === '분석 중'
      ? 'bg-amber-50 text-amber-600'
      : contract.status === '분석 실패'
      ? 'bg-rose-50 text-rose-500'
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

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [deletedContracts, setDeletedContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [showAllContracts, setShowAllContracts] = useState(false);

  const [listOpen, setListOpen] = useState(true);
  const [detailOpen, setDetailOpen] = useState(true);
  const [deleteHistoryOpen, setDeleteHistoryOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingDeleteHistory, setLoadingDeleteHistory] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteHistoryError, setDeleteHistoryError] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const [showUploadErrorModal, setShowUploadErrorModal] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatFileSize = (size?: number | string) => {
    if (!size) return '-';
    if (typeof size === 'string') return size;

    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)}MB`;
    }

    return `${Math.max(1, Math.round(size / 1024))}KB`;
  };

  const getTimeValue = (value?: string) => {
    if (!value) return 0;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const normalizeStatus = (status?: string): ContractStatus => {
    const value = String(status ?? '').toLowerCase();

    if (
      value.includes('complete') ||
      value.includes('done') ||
      value.includes('analyzed') ||
      value.includes('분석 완료')
    ) {
      return '분석 완료';
    }

    if (
      value.includes('processing') ||
      value.includes('running') ||
      value.includes('progress') ||
      value.includes('분석 중')
    ) {
      return '분석 중';
    }

    if (
      value.includes('pending') ||
      value.includes('waiting') ||
      value.includes('requested') ||
      value.includes('대기')
    ) {
      return '분석 대기';
    }

    if (value.includes('fail') || value.includes('error') || value.includes('실패')) {
      return '분석 실패';
    }

    if (value.includes('delete') || value.includes('삭제')) {
      return '삭제됨';
    }

    return '업로드 완료';
  };

  const normalizeContract = (raw: RawContract, fallbackId = 0): Contract => {
    const source = raw.contract ?? raw.data?.contract ?? raw.data ?? raw;
    const analysisSource = raw.analysis ?? source.analysis ?? raw.data?.analysis;
    const id = source.id ?? source.contract_id ?? source.contractId ?? fallbackId;
    const sortSource =
      source.deleted_at ?? source.updated_at ?? source.uploaded_at ?? source.created_at;
    const fileName =
      source.file_name ??
      source.filename ??
      source.original_filename ??
      source.name ??
      `contract_${id}.pdf`;

    return {
      id,
      title: source.title ?? source.name ?? fileName.replace(/\.[^/.]+$/, ''),
      category: source.category ?? source.contract_type ?? '기타계약',
      uploadedAt: formatDate(source.uploaded_at ?? source.created_at),
      updatedAt: source.updated_at ? formatDate(source.updated_at) : '-',
      sortTime: getTimeValue(sortSource),
      status: normalizeStatus(source.analysis_status ?? source.status ?? analysisSource?.status),
      fileName,
      size: formatFileSize(source.file_size ?? source.size),
      summary:
        source.summary ??
        source.analysis_summary ??
        analysisSource?.summary ??
        '아직 등록된 요약 정보가 없어요.',
      deletedAt: source.deleted_at ? formatDate(source.deleted_at) : undefined,
    };
  };

  const extractContractArray = (data: any): RawContract[] => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.contracts)) return data.contracts;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const extractDeletedContractArray = (data: DeletedContractPayload | RawContract[]) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.deleted_contracts)) return data.deleted_contracts;
    if (Array.isArray(data.deletedContracts)) return data.deletedContracts;
    if (Array.isArray(data.history)) return data.history;
    return extractContractArray(data);
  };

  const fetchContracts = useCallback(
    async (preferredContractId?: number | null, preserveSelection = true) => {
    try {
      setLoading(true);

      const response = await client.get('/api/v1/contracts/');
      const list = extractContractArray(response.data)
        .map(normalizeContract)
        .sort((a, b) => b.sortTime - a.sortTime || b.id - a.id);

      const activeList = list.filter((contract) => contract.status !== '삭제됨');

      setContracts(activeList);

      setSelectedContractId((prev) => {
        if (
          preferredContractId &&
          activeList.some((contract) => contract.id === preferredContractId)
        ) {
          return preferredContractId;
        }

        if (preserveSelection && prev && activeList.some((contract) => contract.id === prev)) {
          return prev;
        }

        return activeList[0]?.id ?? null;
      });
    } catch {
      setUploadErrorMessage('계약서 목록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      setShowUploadErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContractDetail = useCallback(async (contractId: number) => {
    try {
      const response = await client.get(`/api/v1/contracts/${contractId}`);
      const detail = normalizeContract(response.data, contractId);

      setContracts((prev) =>
        prev.map((contract) =>
          contract.id === contractId ? { ...contract, ...detail, id: contractId } : contract
        )
      );
    } catch {
      setUploadErrorMessage('계약서 상세 정보를 불러오지 못했어요.');
      setShowUploadErrorModal(true);
    }
  }, []);

  const fetchDeletedContracts = useCallback(async () => {
    try {
      setLoadingDeleteHistory(true);
      setDeleteHistoryError('');

      const response = await client.get('/api/v1/contracts/deleted');
      const list = extractDeletedContractArray(response.data)
        .map((contract, index) => ({
          ...normalizeContract(contract, index + 1),
          status: '삭제됨' as ContractStatus,
        }))
        .sort((a, b) => b.sortTime - a.sortTime || b.id - a.id);

      setDeletedContracts(list);
    } catch (error) {
      console.error('삭제 이력 조회 실패:', error);
      setDeleteHistoryError('삭제 이력을 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoadingDeleteHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
    fetchDeletedContracts();
  }, [fetchContracts, fetchDeletedContracts]);

  useEffect(() => {
    if (selectedContractId) {
      fetchContractDetail(selectedContractId);
    }
  }, [selectedContractId, fetchContractDetail]);

  const visibleContracts = useMemo(() => {
    return contracts.filter(
      (contract) =>
        contract.title.toLowerCase().includes(search.toLowerCase()) ||
        contract.category.toLowerCase().includes(search.toLowerCase()) ||
        contract.fileName.toLowerCase().includes(search.toLowerCase())
    );
  }, [contracts, search]);

  const displayedContracts = useMemo(() => {
    return showAllContracts ? visibleContracts : visibleContracts.slice(0, 5);
  }, [visibleContracts, showAllContracts]);

  useEffect(() => {
    setShowAllContracts(false);
  }, [search]);

  useEffect(() => {
    if (deleteHistoryOpen) {
      fetchDeletedContracts();
    }
  }, [deleteHistoryOpen, fetchDeletedContracts]);

  const selectedContract =
    contracts.find((contract) => contract.id === selectedContractId) ??
    visibleContracts[0] ??
    null;

  const handleOpenDeleteModal = (contractId: number) => {
    setDeleteTargetId(contractId);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteTargetId(null);
    setShowDeleteModal(false);
  };

  const handleConfirmDeleteContract = async () => {
    if (deleteTargetId === null) return;

    const target = contracts.find((contract) => contract.id === deleteTargetId);

    try {
      setDeleting(true);

      await client.delete(`/api/v1/contracts/${deleteTargetId}`);

      const remaining = contracts.filter((contract) => contract.id !== deleteTargetId);

      setContracts(remaining);
      setSelectedContractId(remaining[0]?.id ?? null);
      setShowDeleteModal(false);
      setDeleteTargetId(null);
      setShowAllContracts(false);
      if (target) {
        setDeletedContracts((prev) => [
          {
            ...target,
            status: '삭제됨',
            updatedAt: '방금 전',
            deletedAt: new Date().toLocaleDateString('ko-KR'),
          },
          ...prev.filter((contract) => contract.id !== target.id),
        ]);
      }
      fetchDeletedContracts();
    } catch (error: any) {
      console.error('삭제 실패:', error?.response?.status, error?.response?.data);
      const detail = error?.response?.data?.detail || error?.response?.data?.message;
      setUploadErrorMessage(
        detail
          ? `계약서 삭제에 실패했어요: ${detail}`
          : '계약서 삭제에 실패했어요. 잠시 후 다시 시도해주세요.'
      );
      setShowUploadErrorModal(true);
    } finally {
      setDeleting(false);
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
                  계약서 목록 조회, 삭제 이력 조회, 상세 조회, 삭제를 한 화면에서 관리할 수 있어요.
                </p>
              </div>
            </section>

            <div className="mt-3.5 grid gap-3.5 sm:mt-4 sm:gap-4">
              <div className="mx-auto grid w-full max-w-[920px] gap-3 lg:grid-cols-[0.92fr_1.08fr] lg:gap-4">
                <SectionCard
                  title="계약서 목록 조회"
                  subtitle={
                    loading
                      ? '불러오는 중'
                      : showAllContracts
                      ? `${visibleContracts.length}개 전체 표시`
                      : `${visibleContracts.length}개 중 ${Math.min(visibleContracts.length, 5)}개 표시`
                  }
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
                    {loading && (
                      <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-400 sm:text-[13px]">
                        계약서 목록을 불러오는 중이에요.
                      </div>
                    )}

                    {!loading &&
                      displayedContracts.map((contract) => (
                        <ContractListItem
                          key={contract.id}
                          contract={contract}
                          isActive={selectedContractId === contract.id}
                          onClick={() => setSelectedContractId(contract.id)}
                          onDelete={() => handleOpenDeleteModal(contract.id)}
                        />
                      ))}

                    {!loading && visibleContracts.length === 0 && (
                      <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-400 sm:text-[13px]">
                        조회되는 계약서가 없어요.
                      </div>
                    )}

                    {!loading && visibleContracts.length > 5 && (
                      <button
                        type="button"
                        onClick={() => setShowAllContracts((prev) => !prev)}
                        className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#EEF2F9] px-4 text-[12px] font-semibold text-[#5F75B1] transition hover:opacity-90"
                      >
                        {showAllContracts
                          ? '접기'
                          : `더 보기 (${visibleContracts.length - 5}개 더)`}
                      </button>
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

                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteModal(selectedContract.id)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-[12px] font-medium text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          계약서 삭제
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-[220px] items-center justify-center rounded-[16px] border border-dashed border-slate-200 bg-slate-50 text-center text-[12px] text-slate-400 sm:text-[13px]">
                      표시할 계약서가 없어요.
                    </div>
                  )}
                </SectionCard>
              </div>

              <SectionCard
                title="계약서 삭제 이력 조회"
                subtitle={`${deletedContracts.length}개 삭제 기록`}
                open={deleteHistoryOpen}
                onToggle={() => setDeleteHistoryOpen((prev) => !prev)}
              >
                <div className="mx-auto w-full max-w-[900px] space-y-2.5">
                  {loadingDeleteHistory && (
                    <div className="rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-[12px] text-slate-400 sm:text-[13px]">
                      삭제 이력을 불러오는 중이에요.
                    </div>
                  )}

                  {!loadingDeleteHistory && deleteHistoryError && (
                    <div className="rounded-[16px] border border-dashed border-rose-100 bg-rose-50 px-4 py-8 text-center text-[12px] text-rose-400 sm:text-[13px]">
                      {deleteHistoryError}
                    </div>
                  )}

                  {deletedContracts.map((contract) => (
                    <div key={contract.id} className="rounded-[14px] border border-slate-100 bg-white p-3">
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

                  {!loadingDeleteHistory && !deleteHistoryError && deletedContracts.length === 0 && (
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">
                  계약서를 삭제할까요?
                </h2>
                <p className="mt-2 text-[13px] leading-6 text-slate-500">
                  삭제하면 계약서 파일과 분석 결과를 다시 확인할 수 없습니다.
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
                onClick={handleConfirmDeleteContract}
                disabled={deleting}
                style={{
                  backgroundColor: '#EEF2FF',
                  color: '#4C63D2',
                }}
                className="flex-1 rounded-xl py-2.5 text-[13px] font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUploadErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">알림</h2>
                <p className="mt-2 text-[13px] leading-6 text-slate-500">
                  {uploadErrorMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUploadErrorModal(false)}
                className="text-slate-700"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowUploadErrorModal(false)}
              style={{
                backgroundColor: '#EEF2FF',
                color: '#4C63D2',
              }}
              className="mt-6 w-full rounded-xl py-2.5 text-[13px] font-semibold shadow-sm transition hover:opacity-90"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
