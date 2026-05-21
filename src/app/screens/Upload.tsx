// Upload.tsx
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import {
  ArrowLeft,
  Upload as UploadIcon,
  FileText,
  ImageIcon,
  Type,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  X,
} from 'lucide-react';

type Message = {
  role: 'bot' | 'user';
  text: string;
};

export function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [textInput, setTextInput] = useState('');
  const [selectedTab, setSelectedTab] = useState<'pdf' | 'image' | 'text'>('pdf');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  
  // 변경: 단일 파일(rawFile) 대신 파일 배열(rawFiles)로 관리
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: '안녕하세요! CLAIR입니다. 계약서 분석을 도와드릴게요.',
    },
    {
      role: 'bot',
      text: '분석할 계약서를 업로드해주세요. PDF, 이미지(최대 20장), 또는 텍스트 형태로 업로드할 수 있어요.',
    },
  ]);

  const handleBack = () => {
    navigate('/home');
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleTabChange = (tab: 'pdf' | 'image' | 'text') => {
    setSelectedTab(tab);
    setUploadedFile(null);
    setRawFiles([]); // 파일 배열 초기화

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxImageCount = 20;

    // 1. 이미지 개수 제한 체크 (백엔드 스펙 반영)
    if (selectedTab === 'image' && files.length > maxImageCount) {
      setErrorMessage(`이미지는 한 번에 최대 ${maxImageCount}장까지 업로드 가능합니다.`);
      setShowErrorModal(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. 형식 및 개별 파일 용량 체크
    for (const file of files) {
      const isPdf = selectedTab === 'pdf' && file.type === 'application/pdf';
      const isImage =
        selectedTab === 'image' &&
        ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);

      if (!isPdf && !isImage) {
        setErrorMessage(
          selectedTab === 'pdf'
            ? 'PDF 파일만 업로드할 수 있어요.'
            : 'PNG, JPG, JPEG 이미지 파일만 업로드할 수 있어요.'
        );
        setShowErrorModal(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (file.size > maxSize) {
        setErrorMessage('개별 파일 크기는 10MB 이하만 업로드할 수 있어요.');
        setShowErrorModal(true);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    }

    setRawFiles(files);
    
    // UI에 표시될 파일명 (백엔드 display_name 로직과 통일)
    const displayFileName = files.length > 1 
      ? `${files[0].name} 외 ${files.length - 1}장` 
      : files[0].name;
    
    setUploadedFile(displayFileName);

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: `업로드 완료: ${displayFileName}` },
      {
        role: 'bot',
        text: '업로드가 완료되었어요. 이제 AI 분석을 시작해볼까요?',
      },
    ]);
  };

  const handleTextUpload = () => {
    if (!textInput.trim()) {
      setErrorMessage('내용을 입력해주세요.');
      setShowErrorModal(true);
      return;
    }

    const fileName = '텍스트_계약서.txt';
    const blob = new Blob([textInput], { type: 'text/plain' });
    const file = new File([blob], fileName, { type: 'text/plain' });

    setUploadedFile(fileName);
    setRawFiles([file]);

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: `업로드 완료: ${fileName}` },
      { role: 'bot', text: '업로드가 완료되었어요. 이제 AI 분석을 시작해볼까요?' },
    ]);
  };

  const handleStartAnalysis = async () => {
    if (isAnalyzing) return;
    if (rawFiles.length === 0) {
      setErrorMessage('파일을 다시 업로드해주세요.');
      setShowErrorModal(true);
      return;
    }

    setIsAnalyzing(true);

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: '분석 시작해주세요' },
      {
        role: 'bot',
        text: '좋아요. 지금 바로 분석을 시작할게요. 잠시만 기다려주세요.',
      },
    ]);

    try {
      const formData = new FormData();
      let uploadUrl = '/api/v1/contracts/upload';

      // 이미지 탭일 경우 다중 업로드 전용 엔드포인트 사용
      if (selectedTab === 'image') {
        uploadUrl = '/api/v1/contracts/upload-images';
        rawFiles.forEach((file) => {
          formData.append('files', file); // 백엔드 list[UploadFile] 파라미터명 'files'
        });
      } else {
        formData.append('file', rawFiles[0]); // PDF/Text 단일 업로드
      }

      // 1. 파일 업로드
      const uploadResponse = await client.post(uploadUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const contractId = uploadResponse.data?.id;

      if (!contractId) {
        throw new Error('업로드 응답에서 계약서 ID를 찾을 수 없습니다.');
      }

      // 2. 분석 요청
      await client.post(`/api/v1/contracts/${contractId}/analyze`);

      navigate(`/loading/${contractId}`);
    } catch (error: any) {
      console.error('업로드/분석 요청 에러:', error);
      const detail = error.response?.data?.detail || '서버 통신 중 오류가 발생했습니다.';
      setErrorMessage(detail);
      setShowErrorModal(true);
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = (preset?: string) => {
    const messageToSend = preset ?? inputMessage;
    if (!messageToSend.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: messageToSend }]);

    setTimeout(() => {
      let botResponse = '네, 궁금한 점을 편하게 물어보세요.';
      if (messageToSend.includes('시간') || messageToSend.includes('얼마나')) {
        botResponse = '보통 계약서 분석은 1~2분 정도 걸려요. 문서 길이와 형식에 따라 조금 달라질 수 있어요.';
      } else if (messageToSend.includes('위험') || messageToSend.includes('리스크')) {
        botResponse = '불리한 조항, 계약 기간, 해지 조건 등 주의가 필요한 부분을 중심으로 분석해드려요.';
      } else if (messageToSend.includes('결과') || messageToSend.includes('어떻게')) {
        botResponse = '분석이 끝나면 핵심 요약, 위험 요소, 계약 안정도 등을 한눈에 볼 수 있어요.';
      }
      setMessages((prev) => [...prev, { role: 'bot', text: botResponse }]);
    }, 500);

    setInputMessage('');
  };

  const suggestedQuestions = [
    '계약서 분석은 얼마나 걸리나요?',
    '어떤 위험 요소를 찾나요?',
    '분석 결과는 어떻게 보나요?',
  ];

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 18% 18%, rgba(95,117,177,0.18) 0%, rgba(95,117,177,0.06) 24%, transparent 48%), linear-gradient(180deg, #EEF2F9 0%, #FFFFFF 100%)',
      }}
    >
      {/* multiple 속성을 이미지 탭일 때만 활성화 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={selectedTab === 'image'}
        accept={selectedTab === 'pdf' ? '.pdf' : '.png,.jpg,.jpeg'}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mx-auto flex min-h-screen max-w-[1480px] flex-col px-5 sm:px-8 md:px-10 lg:px-16 xl:px-24">
        <header className="flex h-[72px] items-center sm:h-20">
          <div className="flex w-[72px] items-center justify-start sm:w-[96px]">
            <button
              type="button"
              onClick={handleBack}
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
          <div className="w-[72px] sm:w-[96px]" aria-hidden="true" />
        </header>

        <main className="flex flex-1 items-center justify-center pb-10 sm:pb-12">
          <section className="mx-auto w-full max-w-[720px] lg:max-w-[1080px]">
            <div className="mx-auto max-w-[520px] text-center">
              <div className="mb-4 inline-flex items-center rounded-full border border-white/90 bg-white/82 px-4 py-2 text-[12px] font-medium text-slate-500 shadow-sm backdrop-blur sm:mb-6 sm:px-5 sm:py-2.5 sm:text-[13px]">
                Upload
              </div>
              <h1 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.05em] text-slate-900 sm:text-[40px] lg:text-[52px]">
                계약서 업로드
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-slate-500 sm:text-[16px] sm:leading-8 lg:text-[18px]">
                PDF, 이미지(여러 장 가능), 텍스트 중 편한 방식으로 업로드하고 
                <br />
                AI 분석을 시작해보세요.
              </p>
            </div>

            <div className="mx-auto mt-7 overflow-hidden rounded-[28px] border border-white/90 bg-white/80 shadow-[0_30px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:mt-8 sm:rounded-[32px]">
              <div className="border-b border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(238,242,249,0.72)_100%)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[16px] text-white shadow-lg sm:h-12 sm:w-12 sm:rounded-[18px]"
                    style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)' }}
                  >
                    <Bot size={20} className="sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900 sm:text-[16px]">AI 어시스턴트</h2>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[13px] text-slate-500">온라인</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">
                <div className="p-4 sm:p-6 lg:border-r lg:border-slate-100/80">
                  <div className="rounded-[24px] border border-slate-100 bg-[#F8FAFF] p-4 sm:p-5">
                    <p className="text-[14px] font-semibold text-slate-800 sm:text-[15px]">업로드 방식 선택</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-[18px] bg-white p-1.5 shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleTabChange('pdf')}
                        className={`flex h-[46px] items-center justify-center gap-2 rounded-[14px] text-[13px] font-medium transition-all ${selectedTab === 'pdf' ? 'bg-[#EEF2F9] text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <FileText size={16} /><span className="hidden sm:inline">PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabChange('image')}
                        className={`flex h-[46px] items-center justify-center gap-2 rounded-[14px] text-[13px] font-medium transition-all ${selectedTab === 'image' ? 'bg-[#EEF2F9] text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <ImageIcon size={16} /><span className="hidden sm:inline">이미지</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabChange('text')}
                        className={`flex h-[46px] items-center justify-center gap-2 rounded-[14px] text-[13px] font-medium transition-all ${selectedTab === 'text' ? 'bg-[#EEF2F9] text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        <Type size={16} /><span className="hidden sm:inline">텍스트</span>
                      </button>
                    </div>

                    {!uploadedFile ? (
                      <div className="mt-5">
                        {selectedTab === 'text' ? (
                          <div className="space-y-3">
                            <textarea
                              value={textInput}
                              onChange={(e) => setTextInput(e.target.value)}
                              placeholder="계약서 내용을 입력하세요..."
                              className="h-36 w-full resize-none rounded-[20px] border border-slate-200/80 bg-white px-4 py-4 text-[14px] text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#8097F8] sm:h-44"
                            />
                            <button
                              type="button"
                              onClick={handleTextUpload}
                              className="inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-[18px] text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                              style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)', boxShadow: '0 18px 38px rgba(102,122,242,0.24)' }}
                            >
                              <Sparkles size={18} />텍스트 업로드
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleOpenFileDialog}
                            className="flex w-full flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center transition-all hover:border-[#BFCBFF] hover:bg-[#FCFDFF]"
                          >
                            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] text-white shadow-lg sm:h-20 sm:w-20" style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)' }}>
                              <UploadIcon size={26} />
                            </div>
                            <h3 className="mt-5 text-[16px] font-semibold text-slate-900 sm:text-[18px]">
                              {selectedTab === 'pdf' ? 'PDF 파일 업로드' : '이미지 파일 업로드'}
                            </h3>
                            <p className="mt-2 text-[14px] leading-6 text-slate-500">
                              {selectedTab === 'image' ? '여러 장의 이미지를 선택할 수 있어요. (최대 20장)' : '파일을 클릭해서 업로드하세요.'}
                              <br />최대 10MB까지 가능합니다.
                            </p>
                            <span className="mt-5 inline-flex h-[44px] items-center justify-center rounded-[14px] border border-slate-200 bg-[#F8FAFF] px-5 text-[14px] font-medium text-slate-700">파일 선택</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-[22px] border border-[#DCE4FF] bg-white p-4 sm:p-5">
                        <p className="text-[14px] font-medium text-slate-500">업로드된 파일</p>
                        <div className="mt-3 flex items-center gap-3 rounded-[18px] bg-[#F8FAFF] p-4">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#667AF2] to-[#8097F8] text-white">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[15px] font-semibold text-slate-900">{uploadedFile}</p>
                            <p className="mt-1 text-[13px] text-emerald-600">업로드 준비가 완료되었습니다</p>
                          </div>
                          <button onClick={() => {setUploadedFile(null); setRawFiles([]);}} className="text-slate-400 hover:text-slate-600">
                            <X size={18} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleStartAnalysis}
                          disabled={isAnalyzing}
                          className="mt-4 inline-flex h-[54px] w-full items-center justify-center gap-2 rounded-[18px] text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-70"
                          style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)', boxShadow: '0 18px 38px rgba(102,122,242,0.24)' }}
                        >
                          <Sparkles size={18} />{isAnalyzing ? '분석 요청 중...' : 'AI 분석 시작하기'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 챗 메시지 영역 */}
                <div className="hidden min-h-[380px] flex-col bg-white/30 lg:flex">
                  <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.role === 'bot' && (
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px] text-white" style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)' }}>
                            <Bot size={16} />
                          </div>
                        )}
                        <div className={`max-w-[82%] rounded-[20px] px-4 py-3 text-[14px] leading-6 ${message.role === 'bot' ? 'rounded-tl-[8px] border border-white/90 bg-white text-slate-800 shadow-sm' : 'rounded-tr-[8px] bg-[#6C80DD] text-white'}`}>
                          {message.text}
                        </div>
                        {message.role === 'user' && (
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[14px] bg-slate-800 text-white">
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
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="메시지를 입력하세요..."
                        className="h-[50px] flex-1 rounded-[18px] border border-slate-200/80 bg-white px-4 text-[14px] outline-none focus:border-[#8097F8]"
                      />
                      <button onClick={() => handleSendMessage()} className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-[18px] text-white" style={{ background: 'linear-gradient(135deg, #667AF2 0%, #8097F8 100%)' }}>
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

      {/* 에러 모달 */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[16px] font-semibold text-slate-900">업로드 실패</h2>
                <p className="mt-2 text-[13px] leading-6 text-slate-500">{errorMessage}</p>
              </div>
              <button onClick={() => setShowErrorModal(false)} className="text-slate-700"><X size={18} /></button>
            </div>
            <button onClick={() => setShowErrorModal(false)} className="mt-6 w-full rounded-xl py-2.5 text-[13px] font-semibold bg-[#EEF2FF] text-[#4C63D2]">확인</button>
          </div>
        </div>
      )}
    </div>
  );
}