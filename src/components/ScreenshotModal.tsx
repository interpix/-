import React from 'react';
import { X, Download } from 'lucide-react';

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export const ScreenshotModal: React.FC<ScreenshotModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
}) => {
  if (!isOpen || !imageUrl) return null;

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `falling-gates-frame-${timestamp}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <h3 className="text-sm font-semibold text-white">3D 프레임 스크린샷</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl overflow-hidden border border-white/10 max-h-[60vh] flex items-center justify-center bg-black">
            <img src={imageUrl} alt="3D Gate Frame" className="max-w-full max-h-[55vh] object-contain" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-white/5 rounded-xl transition-colors"
            >
              닫기
            </button>
            <button
              onClick={downloadImage}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>이미지 다운로드 (PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
