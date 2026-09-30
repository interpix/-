import React, { useState, useRef, useEffect } from 'react';
import { X, Video, Download, RefreshCw, AlertCircle, CheckCircle2, Film, Zap, Activity } from 'lucide-react';
import { VideoRecorder } from '../utils/videoRecorder';

interface VideoStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: HTMLCanvasElement | null;
  onTriggerSurge: () => void;
  onTriggerShake: () => void;
  isLiveRecording: boolean;
  setIsLiveRecording: (recording: boolean) => void;
}

export const VideoStudioModal: React.FC<VideoStudioModalProps> = ({
  isOpen,
  onClose,
  canvas,
  onTriggerSurge,
  onTriggerShake,
  isLiveRecording,
  setIsLiveRecording,
}) => {
  const [durationPreset, setDurationPreset] = useState<number>(10); // 5, 10, 15, or 0 (free)
  const [fpsPreset, setFpsPreset] = useState<number>(60);
  const [recordingState, setRecordingState] = useState<'idle' | 'countdown' | 'recording' | 'finished'>('idle');
  const [countdown, setCountdown] = useState<number>(3);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [liveMotionMode, setLiveMotionMode] = useState<boolean>(true); // Free camera interaction during record

  const recorderRef = useRef<VideoRecorder>(new VideoRecorder());
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoBlobUrl) {
        URL.revokeObjectURL(videoBlobUrl);
      }
    };
  }, [videoBlobUrl]);

  // If live recording mode is enabled and currently recording, minimize modal so user can interact
  const isMinimizedForLiveRecord = isLiveRecording && recordingState === 'recording' && liveMotionMode;

  const startCountdown = () => {
    setErrorMsg(null);
    if (!canvas) {
      setErrorMsg('3D 캔버스 요소를 찾을 수 없습니다.');
      return;
    }

    setRecordingState('countdown');
    setCountdown(3);

    let count = 3;
    const interval = window.setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        executeRecording();
      }
    }, 700);
  };

  const executeRecording = () => {
    if (!canvas) return;

    setRecordingState('recording');
    setIsLiveRecording(true);
    setElapsedTime(0);
    setProgressPercent(0);

    const recorder = recorderRef.current;
    const success = recorder.startRecording(canvas, {
      durationSeconds: durationPreset,
      fps: fpsPreset,
      onProgress: (elapsed, percent) => {
        setElapsedTime(elapsed);
        setProgressPercent(percent);
      },
      onFinish: (blob, url) => {
        setVideoBlob(blob);
        setVideoBlobUrl(url);
        setRecordingState('finished');
        setIsLiveRecording(false);
      },
      onError: (err) => {
        setErrorMsg(err.message || '영상 녹화 중 오류가 발생했습니다.');
        setRecordingState('idle');
        setIsLiveRecording(false);
      },
    });

    if (!success) {
      setErrorMsg('녹화를 시작할 수 없습니다. 브라우저 지원 여부를 확인하세요.');
      setRecordingState('idle');
      setIsLiveRecording(false);
    }
  };

  const stopManualRecording = () => {
    recorderRef.current.stopRecording();
    setIsLiveRecording(false);
  };

  const handleDownload = () => {
    if (!videoBlobUrl) return;
    const a = document.createElement('a');
    a.href = videoBlobUrl;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `bofu-falling-gates-3d-${timestamp}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetRecording = () => {
    if (videoBlobUrl) {
      URL.revokeObjectURL(videoBlobUrl);
      setVideoBlobUrl(null);
    }
    setVideoBlob(null);
    setRecordingState('idle');
    setIsLiveRecording(false);
    setElapsedTime(0);
    setProgressPercent(0);
  };

  // FLOATING MINIMIZED BAR DURING LIVE MOTION RECORDING
  if (isMinimizedForLiveRecord) {
    return (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-rose-500/40 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="font-mono-nums text-xs font-bold text-white tracking-wider">
            REC {elapsedTime.toFixed(1)}s {durationPreset > 0 ? `/ ${durationPreset}s` : ''}
          </span>
        </div>

        <div className="h-4 w-px bg-white/20" />

        <div className="text-[11px] text-cyan-300 font-medium hidden sm:inline">
          마우스 드래그로 화면 회전 & 줌 가능!
        </div>

        {/* Live triggers for BOFU sync */}
        <button
          onClick={onTriggerShake}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg transition-colors"
        >
          <Activity className="w-3 h-3" />
          <span>비트 쉐이크</span>
        </button>

        <button
          onClick={onTriggerSurge}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-colors"
        >
          <Zap className="w-3 h-3" />
          <span>가속 서지</span>
        </button>

        <button
          onClick={stopManualRecording}
          className="px-3 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
        >
          녹화 완료
        </button>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-semibold text-white">BOFU / BGA 3D 모션 영상 스튜디오</h2>
              <p className="text-xs text-slate-400">실시간 카메라 모션 녹화 및 고화질 비디오 추출</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STATE 1: IDLE / CONFIGURATION */}
          {recordingState === 'idle' && (
            <div className="space-y-4">
              {/* Duration Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">녹화 길이 설정 (Duration)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 5, label: '5초 루프' },
                    { value: 10, label: '10초 숏폼' },
                    { value: 15, label: '15초 클립' },
                    { value: 0, label: '수동 녹화' },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setDurationPreset(p.value)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        durationPreset === p.value
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Framerate Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">프레임 레이트 (FPS)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFpsPreset(60)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      fpsPreset === 60
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    60 FPS (BGA 리듬게임 초고화질)
                  </button>
                  <button
                    onClick={() => setFpsPreset(30)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      fpsPreset === 30
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-semibold'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    30 FPS (표준 규격)
                  </button>
                </div>
              </div>

              {/* Live Motion Recording Switch */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>직접 움직이는 라이브 모션 녹화 활성화</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={liveMotionMode}
                    onChange={(e) => setLiveMotionMode(e.target.checked)}
                    className="accent-cyan-400 rounded cursor-pointer w-4 h-4"
                  />
                </label>
                <p className="text-[11px] text-slate-400">
                  녹화 시작 시 창이 상단에 미니바로 축소되어, <strong>마우스 드래그/휠 줌/단축키로 직접 카메라 앵글을 연출하며 녹화</strong>할 수 있습니다.
                </p>
              </div>

              {/* Start Recording CTA */}
              <button
                onClick={startCountdown}
                className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/20 active:scale-95 transition-all"
              >
                <Video className="w-4 h-4 fill-slate-950" />
                <span>{liveMotionMode ? '라이브 모션 녹화 시작' : '영상 녹화 시작'}</span>
              </button>
            </div>
          )}

          {/* STATE 2: COUNTDOWN */}
          {recordingState === 'countdown' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="text-6xl font-bold font-display text-cyan-400 animate-ping">
                {countdown}
              </div>
              <p className="text-sm text-slate-400">카메라 앵글을 잡으세요...</p>
            </div>
          )}

          {/* STATE 3: RECORDING IN PROGRESS (Non-minimized fallback) */}
          {recordingState === 'recording' && !liveMotionMode && (
            <div className="py-8 space-y-6">
              <div className="flex items-center justify-center gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-mono-nums text-lg font-semibold tracking-wider text-white">
                  REC {elapsedTime.toFixed(1)}s {durationPreset > 0 ? `/ ${durationPreset}s` : ''}
                </span>
              </div>

              {durationPreset > 0 && (
                <div className="space-y-1.5">
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-400 h-full transition-all duration-100 ease-linear rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={onTriggerShake}
                  className="px-3.5 py-2 text-xs font-medium text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 rounded-xl transition-colors"
                >
                  ⚡ 비트 쉐이크
                </button>
                <button
                  onClick={onTriggerSurge}
                  className="px-3.5 py-2 text-xs font-medium text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl transition-colors"
                >
                  ⚡ 폭포 가속
                </button>
                {durationPreset === 0 && (
                  <button
                    onClick={stopManualRecording}
                    className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors"
                  >
                    녹화 중지
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STATE 4: FINISHED & PREVIEW */}
          {recordingState === 'finished' && videoBlobUrl && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>BOFU 3D 영상 렌더링 완료! 프리뷰 확인 후 다운로드하세요.</span>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-white/10 shadow-inner">
                <video
                  ref={videoPreviewRef}
                  src={videoBlobUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 font-mono-nums p-2.5 rounded-lg bg-white/5">
                <span>길이: {elapsedTime.toFixed(1)}초</span>
                <span>용량: {videoBlob ? `${(videoBlob.size / (1024 * 1024)).toFixed(1)} MB` : '-'}</span>
                <span>코덱: WebM VP9 (Premiere/AfterEffects 합성 최적화)</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={resetRecording}
                  className="flex-1 py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-xs font-medium text-slate-300 bg-white/10 hover:bg-white/15 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>새로 녹화</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex-1 py-2.5 px-4 flex items-center justify-center gap-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>비디오 파일 다운로드</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
