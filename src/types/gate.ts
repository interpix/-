export type GateStyle =
  | 'cyber'
  | 'torii'
  | 'monolith'
  | 'astral'
  | 'prism'       // Neon Diamond / Prism Portal
  | 'gothic'      // Cyber Gothic Cathedral Arch
  | 'voxel'       // Glitch / Voxel Data Arch
  | 'warp_ring';  // Hyper-speed Accelerator Ring

export type CameraMode = 'worms_eye' | 'cinematic' | 'dive_through' | 'free';

export type ColorTheme = 'cyber' | 'solar' | 'void' | 'aurora' | 'bofu_neon';

export type MotionBlurLevel = 'off' | 'subtle' | 'heavy' | 'overdrive';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  emissive: string;
  ambient: string;
  fog: string;
  background: string;
}

export interface GateConfig {
  style: GateStyle;
  mixedStyles: boolean;         // Random mixed gate cascade
  cameraMode: CameraMode;
  theme: ColorTheme;
  speed: number;                // 15 to 220 units/sec (Hyper-speed for BOFU!)
  gateCount: number;            // 6 to 30
  spacing: number;
  scale: number;                // 0.6 to 2.2
  swayIntensity: number;        // rotational turbulence
  wireframe: boolean;
  
  // Particle & Streak Controls
  streakParticles: boolean;     // 별똥별 직선 스트릭 (Shooting star / Warp speed lines)
  streakLength: number;         // 길이 (4 to 28)
  streakDensity: number;        // 밀도 수량 (200 to 1800)
  ambientMist: boolean;

  // BOFU & Speed FX
  motionBlur: MotionBlurLevel;  // Afterimage & speed trails
  velocityFov: boolean;         // Speed-dependent FOV fisheye distortion
  lightBeams: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  autoRotateCamera: boolean;
}

export interface SceneMetrics {
  fps: number;
  activeGates: number;
  fallSpeedUnits: number;
  altitudeOffset: number;
  cyclesCount: number;
  currentFov: number;
}
