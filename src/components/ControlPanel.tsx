import React, { useState } from 'react';
import { GateConfig, GateStyle, ColorTheme, CameraMode, MotionBlurLevel } from '../types/gate';
import {
  Sliders,
  Camera,
  Eye,
  Zap,
  Palette,
  Layers,
  ChevronRight,
  ChevronLeft,
  CameraIcon,
  Flame,
  Wind,
  Sparkles,
  Shuffle,
  Activity,
} from 'lucide-react';

interface ControlPanelProps {
  config: GateConfig;
  onChangeConfig: (newConfig: Partial<GateConfig>) => void;
  onTriggerSurge: () => void;
  onTriggerShake: () => void;
  onCaptureScreenshot: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  onTriggerSurge,
  onTriggerShake,
  onCaptureScreenshot,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const styles: { id: GateStyle; label: string; desc: string }[] = [
    { id: 'cyber', label: '사이버 퀀텀', desc: '육각 네온 & 플라즈마 링' },
    { id: 'prism', label: '네온 다이아몬드', desc: '각진 프리즘 & 레이저' },
    { id: 'gothic', label: '고딕 성당 아치', desc: '첨두 아치 & 로제타 창' },
    { id: 'warp_ring', label: '워프 가속기 링', desc: '초고속 터빈 링' },
    { id: 'torii', label: '네오 토리이', desc: '신성한 일본식 대형 아치' },
    { id: 'monolith', label: '브루탈리스트', desc: '티타늄 & 발광 슬릿' },
    { id: 'astral', label: '스타게이트', desc: '회전하는 쉐브론 링' },
    { id: 'voxel', label: '글리치 복셀', desc: '비대칭 데이터 큐브' },
  ];

  const themes: { id: ColorTheme; label: string; dotColor: string }[] = [
    { id: 'bofu_neon', label: 'BOFU 애시드 네온', dotColor: 'bg-rose-500' },
    { id: 'cyber', label: '사이버펑크', dotColor: 'bg-cyan-400' },
    { id: 'solar', label: '솔라 앰버', dotColor: 'bg-amber-400' },
    { id: 'void', label: '보이드 화이트', dotColor: 'bg-slate-200' },
    { id: 'aurora', label: '오로라 에메랄드', dotColor: 'bg-emerald-400' },
  ];

  const cameraModes: { id: CameraMode; label: string }[] = [
    { id: 'worms_eye', label: '천장 앙각 뷰 (Worm)' },
    { id: 'dive_through', label: '게이트 관통 뷰 (Dive)' },
    { id: 'cinematic', label: '시네마틱 궤도 (Orbit)' },
    { id: 'free', label: '자유 모션 드래그 (Free)' },
  ];

  const motionBlurOptions: { id: MotionBlurLevel; label: string }[] = [
    { id: 'off', label: '끄기' },
    { id: 'subtle', label: '기본' },
    { id: 'heavy', label: '강함' },
    { id: 'overdrive', label: '🔥 극한 (BOFU)' },
  ];

  return (
    <aside
      className={`absolute top-20 right-6 z-20 transition-all duration-300 ${
        isOpen ? 'w-84' : 'w-11'
      }`}
    >
      <div className="relative rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-3 left-3 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-10"
          title={isOpen ? '패널 접기' : '컨트롤 패널 열기'}
          aria-label="Toggle Panel"
        >
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {isOpen && (
          <div className="p-5 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="pl-7 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span>BOFU 영상 & 비주얼 튜너</span>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">PRO</span>
                </h2>
                <p className="text-[11px] text-slate-400">8종 게이트 · 워프 스트릭 · 모션블러</p>
              </div>
              <button
                onClick={onCaptureScreenshot}
                title="현재 프레임 4K PNG 캡처"
                className="p-1.5 text-slate-300 hover:text-cyan-400 hover:bg-white/5 rounded-lg border border-white/10 transition-colors"
              >
                <CameraIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 1. Gate Archetype Selector */}
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  게이트 디자인 (8종)
                </label>
                <button
                  onClick={() => onChangeConfig({ mixedStyles: !config.mixedStyles })}
                  className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-md border transition-all ${
                    config.mixedStyles
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="모든 게이트가 번갈아가며 혼합 낙하합니다"
                >
                  <Shuffle className="w-2.5 h-2.5" />
                  <span>무작위 믹스</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onChangeConfig({ style: s.id, mixedStyles: false })}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      config.style === s.id && !config.mixedStyles
                        ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-xs font-medium truncate">{s.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{s.desc}</div>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. BOFU Motion Blur & Speed Feel */}
            <section className="space-y-2.5 p-3 rounded-xl bg-rose-950/20 border border-rose-500/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  모션 블러 강도 (Motion Blur)
                </label>
                <span className="text-[10px] font-mono-nums text-rose-400 uppercase">
                  {config.motionBlur}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {motionBlurOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onChangeConfig({ motionBlur: opt.id })}
                    className={`py-1.5 px-1 rounded-lg text-center text-[11px] font-medium border transition-all ${
                      config.motionBlur === opt.id
                        ? 'bg-rose-500/30 border-rose-400 text-rose-200 font-bold shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer pt-1">
                <span>다이내믹 속도 FOV 왜곡 (Fisheye)</span>
                <input
                  type="checkbox"
                  checked={config.velocityFov}
                  onChange={(e) => onChangeConfig({ velocityFov: e.target.checked })}
                  className="accent-rose-400 rounded cursor-pointer"
                />
              </label>
            </section>

            {/* 3. Shooting Star / Warp Streaks (별똥별 직선 스트릭) */}
            <section className="space-y-2.5 p-3 rounded-xl bg-cyan-950/20 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  별똥별 직선 스트릭 (Warp Lines)
                </label>
                <input
                  type="checkbox"
                  checked={config.streakParticles}
                  onChange={(e) => onChangeConfig({ streakParticles: e.target.checked })}
                  className="accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {config.streakParticles && (
                <div className="space-y-2 pt-1">
                  {/* Streak Length */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>스트릭 길이 (광선 길이)</span>
                      <span className="font-mono-nums text-cyan-300">{config.streakLength}</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="35"
                      step="1"
                      value={config.streakLength}
                      onChange={(e) => onChangeConfig({ streakLength: Number(e.target.value) })}
                      className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1"
                    />
                  </div>

                  {/* Streak Density */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>스트릭 밀도 수량</span>
                      <span className="font-mono-nums text-cyan-300">{config.streakDensity}개</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="1400"
                      step="50"
                      value={config.streakDensity}
                      onChange={(e) => onChangeConfig({ streakDensity: Number(e.target.value) })}
                      className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* 4. Speed & Physics */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  낙하 속도 & 가속 제어
                </label>
                <button
                  onClick={() => onChangeConfig({ speed: config.speed >= 120 ? 40 : 150 })}
                  className={`px-2 py-0.5 text-[10px] rounded font-semibold border ${
                    config.speed >= 120
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  {config.speed >= 120 ? '⚡ 워프 해제' : '🚀 워프 150m/s'}
                </button>
              </div>

              {/* Fall Speed (up to 200 m/s!) */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>낙하 속도 (Velocity)</span>
                  <span className="font-mono-nums text-white font-bold">{config.speed} m/s</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="200"
                  step="5"
                  value={config.speed}
                  onChange={(e) => onChangeConfig({ speed: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Gate Count */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>동시 게이트 수량</span>
                  <span className="font-mono-nums text-white">{config.gateCount}개</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="28"
                  step="2"
                  value={config.gateCount}
                  onChange={(e) => onChangeConfig({ gateCount: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
              </div>

              {/* Turbulence Sway */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>공기역학 흔들림 (Sway)</span>
                  <span className="font-mono-nums text-white">{config.swayIntensity.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.0"
                  step="0.2"
                  value={config.swayIntensity}
                  onChange={(e) => onChangeConfig({ swayIntensity: Number(e.target.value) })}
                  className="w-full accent-cyan-400 bg-white/10 rounded-lg cursor-pointer h-1.5"
                />
              </div>
            </section>

            {/* 5. Color Themes */}
            <section className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                광원 및 발광 컬러
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onChangeConfig({ theme: t.id })}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left border text-xs transition-all ${
                      config.theme === t.id
                        ? 'bg-white/15 border-white/30 text-white font-medium shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${t.dotColor}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 6. Quick Action Triggers for BOFU Recording */}
            <div className="pt-2 space-y-2 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onTriggerShake}
                  className="py-2.5 px-3 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 transition-all active:scale-95"
                >
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>비트 쉐이크</span>
                </button>

                <button
                  onClick={onTriggerSurge}
                  className="py-2.5 px-3 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>가속 서지</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
