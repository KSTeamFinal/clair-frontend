import { useState, type ChangeEvent, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import client from '../../api/client';
import { X, Image as ImageIcon, Bot } from 'lucide-react';

export function ResultDashboard() {
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const isAllowedFile = (file: File) => {
    const name = file.name.toLowerCase();

    return (
      file.type === 'application/pdf' ||
      file.type === 'image/png' ||
      file.type === 'image/jpeg' ||
      name.endsWith('.pdf') ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg')
    );
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(isAllowedFile);

    if (validFiles.length === 0) {
      alert('PDF, JPG, PNG 파일만 업로드할 수 있어요.');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    addFiles(files);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const mergeFilesToPdf = async (files: File[]) => {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const name = file.name.toLowerCase();

      if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } else {
        let image;

        if (
          file.type === 'image/png' ||
          name.endsWith('.png')
        ) {
          image = await mergedPdf.embedPng(bytes);
        } else {
          image = await mergedPdf.embedJpg(bytes);
        }

        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 40;

        const scale = Math.min(
          (pageWidth - margin * 2) / image.width,
          (pageHeight - margin * 2) / image.height
        );

        const imageWidth = image.width * scale;
        const imageHeight = image.height * scale;

        const page = mergedPdf.addPage([pageWidth, pageHeight]);

        page.drawImage(image, {
          x: (pageWidth - imageWidth) / 2,
          y: (pageHeight - imageHeight) / 2,
          width: imageWidth,
          height: imageHeight,
        });
      }
    }

    const mergedBytes = await mergedPdf.save();

    return new File([mergedBytes], 'merged-contract.pdf', {
      type: 'application/pdf',
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadFile =
        selectedFiles.length === 1
          ? selectedFiles[0]
          : await mergeFilesToPdf(selectedFiles);

      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await client.post('/api/v1/contracts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const contractId = response.data.id || response.data.contractId;

      navigate(`/analysis/${contractId}`);
    } catch (err) {
      console.error(err);
      alert('업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-[#F8FAFC] p-10">
      <div className="flex h-[800px] w-full max-w-6xl gap-6">
        <div className="flex w-1/2 flex-col rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            계약서 업로드
          </h2>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="mb-6 rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 text-center"
          >
            <p className="mb-3 font-bold text-[#667AF2]">
              이미지/PDF 파일 선택 또는 드래그
            </p>

            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-xl bg-white p-3 text-sm text-slate-600"
            />

            <p className="mt-3 text-xs text-slate-400">
              여러 이미지는 하나의 PDF로 합쳐서 업로드됩니다.
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {selectedFiles.length === 0 && (
              <div className="py-20 text-center text-slate-400">
                파일을 선택해주세요.
              </div>
            )}

            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${file.lastModified}-${idx}`}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ImageIcon size={18} className="shrink-0 text-[#667AF2]" />
                  <span className="truncate text-sm font-medium text-slate-700">
                    {file.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="shrink-0 text-slate-400 transition hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={selectedFiles.length === 0 || isUploading}
            onClick={handleUpload}
            className="mt-6 w-full rounded-2xl bg-[#667AF2] py-5 font-bold text-white shadow-lg shadow-blue-100 transition disabled:bg-slate-200 disabled:shadow-none"
          >
            {isUploading
              ? '업로드 중...'
              : `${selectedFiles.length}개의 파일 업로드하기`}
          </button>
        </div>

        <div className="flex w-1/2 flex-col overflow-hidden rounded-[40px] border border-slate-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#667AF2] text-white">
              <Bot size={22} />
            </div>
            <span className="font-bold text-slate-800">AI 어시스턴트</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/30 p-8">
            <div className="max-w-[90%] rounded-3xl rounded-tl-none border border-slate-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
              여러 장을 선택하면 하나의 PDF로 합쳐서 분석합니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}