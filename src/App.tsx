import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GateScene } from './graphics/GateScene';
import { GateConfig, CameraMode, SceneMetrics } from './types/gate';
import { HeaderBar } from './components/HeaderBar';
import { ControlPanel } from './components/ControlPanel';
import { HUDMetrics } from './components/HUDMetrics';
import { VideoStudioModal } from './components/VideoStudioModal';
import { ScreenshotModal } from './components/ScreenshotModal';
import { ArrowUp, Video, Sparkles, Eye, Compass, Activity, Wind } from 'lucide-react';

const DEFAULT_CONFIG: GateConfig = {
  style: 'cyber',
  mixedStyles: false,
  cameraMode: 'worms_eye',
  theme: 'bofu_neon',       // High-voltage BOFU acid neon theme!
  speed: 65,                // Fast default speed for great momentum
  gateCount: 16,
  spacing: 16,
  scale: 1.1,
  swayIntensity: 0.9,
  wireframe: false,
  streakParticles: true,    // Shooting star / warp streak lines ("슉슉")
  streakLength: 18,
  streakDensity: 700,
  ambientMist: true,
  motionBlur: 'heavy',      // "모션블러 빡시게"
  velocityFov: true,        // Speed-dependent fisheye distortion
  lightBeams: true,
  soundEnabled: false,
  soundVolume: 0.6,
  autoRotateCamera: true,
};

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<GateScene | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  const [config, setConfig] = useState<GateConfig>(DEFAULT_CONFIG);
  const [metrics, setMetrics] = useState<SceneMetrics>({
    fps: 60,
    activeGates: 16,
    fallSpeedUnits: 65,
    altitudeOffset: 120,
    cyclesCount: 0,
    currentFov: 60,
  });

  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);
  const [isLiveRecording, setIsLiveRecording] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isHUDVisible, setIsHUDVisible] = useState(true);
  const [webGLError, setWebGLError] = useState<string | null>(null);

  // Initialize 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const scene = new GateScene(
        containerRef.current,
        DEFAULT_CONFIG,
        (newMetrics) => {
          setMetrics(newMetrics);
        }
      );
      sceneRef.current = scene;
      setCanvasElement(scene.getCanvas());
    } catch {
      setWebGLError('WebGL 3D 그래픽스를 초기화하지 못했습니다. WebGL 지원 브라우저를 확인하세요.');
    }

    return () => {
      sceneRef.current?.destroy();
      sceneRef.current = null;
    };
  }, []);

  const handleConfigChange = useCallback((patch: Partial<GateConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...patch };
      sceneRef.current?.updateConfig(patch);
      return updated;
    });
  }, []);

  const triggerSurge = useCallback(() => {
    sceneRef.current?.triggerSurge();
  }, []);

  const triggerShake = useCallback(() => {
    sceneRef.current?.triggerScreenShake(1.2);
  }, []);

  const toggleSound = useCallback(() => {
    const nextState = !config.soundEnabled;
    handleConfigChange({ soundEnabled: nextState });
  }, [config.soundEnabled, handleConfigChange]);

  const captureScreenshot = useCallback(() => {
    if (!sceneRef.current) return;
    const url = sceneRef.current.captureScreenshot();
    setScreenshotUrl(url);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        triggerSurge();
      } else if (e.key === 'b' || e.key === 'B') {
        triggerShake();
      } else if (e.key === '1') {
        handleConfigChange({ cameraMode: 'worms_eye' });
      } else if (e.key === '2') {
        handleConfigChange({ cameraMode: 'dive_through' });
      } else if (e.key === '3') {
        handleConfigChange({ cameraMode: 'cinematic' });
      } else if (e.key === '4') {
        handleConfigChange({ cameraMode: 'free' });
      } else if (e.key === 'h' || e.key === 'H') {
        setIsHUDVisible((prev) => !prev);
      } else if (e.key === 'v' || e.key === 'V') {
        setIsVideoStudioOpen(true);
      } else if (e.key === 'c' || e.key === 'C') {
        captureScreenshot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerSurge, triggerShake, handleConfigChange, captureScreenshot]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#04060a] text-slate-100 font-sans select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* WebGL Fallback */}
      {webGLError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 text-center">
          <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-rose-500/30 text-slate-300 space-y-3">
            <h2 className="text-base font-semibold text-rose-400">WebGL 그래픽 초기화 실패</h2>
            <p className="text-xs text-slate-400">{webGLError}</p>
          </div>
        </div>
      )}

      {/* HUD Layer */}
      {isHUDVisible && !isLiveRecording && (
        <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between">
          {/* Top Bar Header */}
          <div className="pointer-events-auto">
            <HeaderBar
              currentCamera={config.cameraMode}
              onSelectCamera={(mode: CameraMode) => handleConfigChange({ cameraMode: mode })}
              onOpenVideoStudio={() => setIsVideoStudioOpen(true)}
              soundEnabled={config.soundEnabled}
              onToggleSound={toggleSound}
              onTriggerSurge={triggerSurge}
            />
          </div>

          {/* Right Floating Control Panel */}
          <div className="pointer-events-auto">
            <ControlPanel
              config={config}
              onChangeConfig={handleConfigChange}
              onTriggerSurge={triggerSurge}
              onTriggerShake={triggerShake}
              onCaptureScreenshot={captureScreenshot}
            />
          </div>

          {/* Bottom Left HUD Metrics */}
          <HUDMetrics metrics={metrics} motionBlur={config.motionBlur} />

          {/* Bottom Center Quick Floating Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 shadow-xl">
            <button
              onClick={() => handleConfigChange({ cameraMode: 'worms_eye' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                config.cameraMode === 'worms_eye'
                  ? 'bg-cyan-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>천장 낙하 뷰</span>
            </button>

            <button
              onClick={() => handleConfigChange({ cameraMode: 'dive_through' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-medium transition-all ${
                config.cameraMode === 'dive_through'
                  ? 'bg-cyan-400 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>관통 뷰</span>
            </button>

            {/* Beat Impact trigger */}
            <button
              onClick={triggerShake}
              title="비트 임팩트 카메라 흔들림 (B 키)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 transition-all active:scale-95"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>비트 쉐이크 (B)</span>
            </button>

            {/* Surge Acceleration */}
            <button
              onClick={triggerSurge}
              title="초고속 게이트 폭포 급강하 (Space 키)"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-xl font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>폭포 급강하 (Space)</span>
            </button>

            {/* Video Record CTA */}
            <button
              onClick={() => setIsVideoStudioOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-rose-400 via-pink-400 to-cyan-400 hover:opacity-90 transition-all shadow-sm"
            >
              <Video className="w-3.5 h-3.5" />
              <span>BOFU 영상 제작</span>
            </button>
          </div>

          {/* Bottom Right Keyboard Shortcuts Hint */}
          <div className="absolute bottom-6 right-6 z-20 pointer-events-none hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-mono-nums">
            <span>[Space] 급강하</span>
            <span>·</span>
            <span>[B] 비트 쉐이크</span>
            <span>·</span>
            <span>[1~4] 카메라</span>
            <span>·</span>
            <span>[H] HUD 숨김</span>
          </div>
        </div>
      )}

      {/* Floating HUD Restore Button when HUD is hidden */}
      {!isHUDVisible && !isLiveRecording && (
        <button
          onClick={() => setIsHUDVisible(true)}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-all shadow-xl backdrop-blur-md"
          title="HUD 다시 표시하기 (단축키: H)"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}

      {/* Video Studio Modal & Live Motion Record Bar */}
      <VideoStudioModal
        isOpen={isVideoStudioOpen}
        onClose={() => setIsVideoStudioOpen(false)}
        canvas={canvasElement}
        onTriggerSurge={triggerSurge}
        onTriggerShake={triggerShake}
        isLiveRecording={isLiveRecording}
        setIsLiveRecording={setIsLiveRecording}
      />

      {/* Screenshot Frame Modal */}
      <ScreenshotModal
        isOpen={!!screenshotUrl}
        onClose={() => setScreenshotUrl(null)}
        imageUrl={screenshotUrl}
      />
    </div>
  );
}
