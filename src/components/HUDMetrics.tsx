import React from 'react';
import { SceneMetrics, MotionBlurLevel } from '../types/gate';

interface HUDMetricsProps {
  metrics: SceneMetrics;
  motionBlur: MotionBlurLevel;
}

export const HUDMetrics: React.FC<HUDMetricsProps> = ({ metrics, motionBlur }) => {
  return (
    <div className="absolute bottom-6 left-6 z-20 pointer-events-none select-none">
      <div className="p-3.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/10 text-slate-300">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 tracking-wider mb-1.5 uppercase">
          <span>BOFU BGA 실시간 텔레메트리</span>
          {motionBlur !== 'off' && (
            <span className="text-[10px] text-rose-400 font-mono-nums lowercase">
              blur: {motionBlur}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono-nums">
          <div>
            <span className="text-slate-400">속도 </span>
            <span className="font-semibold text-cyan-400">{metrics.fallSpeedUnits}</span>
            <span className="text-[10px] text-slate-400 ml-0.5">m/s</span>
          </div>

          <span className="text-slate-400" aria-hidden="true">·</span>

          <div>
            <span className="text-slate-400">게이트 </span>
            <span className="font-semibold text-white">{metrics.activeGates}</span>
            <span className="text-[10px] text-slate-400 ml-0.5">개</span>
          </div>

          <span className="text-slate-400" aria-hidden="true">·</span>

          <div>
            <span className="text-slate-400">FOV </span>
            <span className="font-semibold text-amber-300">{metrics.currentFov}°</span>
          </div>

          <span className="text-slate-400" aria-hidden="true">·</span>

          <div>
            <span className="text-slate-400">FPS </span>
            <span className={`font-semibold ${metrics.fps >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {metrics.fps}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
