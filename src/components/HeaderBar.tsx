import React from 'react';
import { CameraMode } from '../types/gate';
import { Video, Volume2, VolumeX, Sparkles, Maximize2 } from 'lucide-react';

interface HeaderBarProps {
  currentCamera: CameraMode;
  onSelectCamera: (mode: CameraMode) => void;
  onOpenVideoStudio: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onTriggerSurge: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentCamera,
  onSelectCamera,
  onOpenVideoStudio,
  soundEnabled,
  onToggleSound,
  onTriggerSurge,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="relative z-30 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
      {/* Zone 1: Brand Wordmark (Single text element in display face) */}
      <div className="flex items-center gap-3">
        <a href="/" className="font-display text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors">
          Dimensional Descent
        </a>
        <span className="hidden sm:inline text-xs text-slate-400">·</span>
        <span className="hidden sm:inline text-xs text-slate-400 font-medium">
          3D Gate Fall System
        </span>
      </div>

      {/* Zone 2: 4 Clean Nav Selectors for Camera Modes */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => onSelectCamera('worms_eye')}
          className={`transition-colors hover:text-white pb-0.5 border-b-2 ${
            currentCamera === 'worms_eye'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'border-transparent text-slate-400'
          }`}
        >
          천장 앙각 뷰 (Worm's Eye)
        </button>

        <button
          onClick={() => onSelectCamera('dive_through')}
          className={`transition-colors hover:text-white pb-0.5 border-b-2 ${
            currentCamera === 'dive_through'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'border-transparent text-slate-400'
          }`}
        >
          게이트 관통 뷰 (Dive-Through)
        </button>

        <button
          onClick={() => onSelectCamera('cinematic')}
          className={`transition-colors hover:text-white pb-0.5 border-b-2 ${
            currentCamera === 'cinematic'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'border-transparent text-slate-400'
          }`}
        >
          시네마틱 궤도 (Cinematic)
        </button>

        <button
          onClick={() => onSelectCamera('free')}
          className={`transition-colors hover:text-white pb-0.5 border-b-2 ${
            currentCamera === 'free'
              ? 'text-cyan-400 border-cyan-400 font-semibold'
              : 'border-transparent text-slate-400'
          }`}
        >
          자유 회전 (Free Orbit)
        </button>
      </nav>

      {/* Zone 3: 1-2 Primary Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Surge button */}
        <button
          onClick={onTriggerSurge}
          title="게이트 급강하 가속 (Space key)"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">폭포 가속</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? '음소거' : '사운드 켜기'}
          className="p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          aria-label="Sound Toggle"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          title="전체화면"
          className="hidden sm:flex p-2 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          aria-label="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Video Production Studio Action */}
        <button
          onClick={onOpenVideoStudio}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm hover:shadow-cyan-400/25 transition-all whitespace-nowrap"
        >
          <Video className="w-4 h-4 text-slate-950" />
          <span>영상 제작 및 녹화</span>
        </button>
      </div>
    </header>
  );
};
