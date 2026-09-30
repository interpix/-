import * as THREE from 'three';
import { CameraMode, GateConfig, GateStyle, SceneMetrics, MotionBlurLevel } from '../types/gate';
import { createGateMaterials, buildGateByStyle } from './gateBuilders';
import { getThemeColors } from './gateThemes';
import { soundEngine } from '../audio/soundEngine';

interface GateInstance {
  group: THREE.Group;
  y: number;
  rotationSpeedY: number;
  swayPhase: number;
  swaySpeed: number;
  passedCamera: boolean;
  scaleVar: number;
  style: GateStyle;
}

const ALL_STYLES: GateStyle[] = [
  'cyber',
  'torii',
  'monolith',
  'astral',
  'prism',
  'gothic',
  'voxel',
  'warp_ring',
];

export class GateScene {
  private container: HTMLElement;
  public canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private config: GateConfig;
  private gates: GateInstance[] = [];
  private gateGroup: THREE.Group;
  private ceilingGroup: THREE.Group;
  private floorGroup: THREE.Group;

  // Warp Streak Line System (별똥별 직선 스트릭)
  private streakLineSegments: THREE.LineSegments | null = null;
  private streakPositions: Float32Array = new Float32Array(0);
  private streakCount: number = 600;

  // Ambient mist particles
  private ambientParticleSystem: THREE.Points | null = null;

  // Lighting
  private keyLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private descentLight: THREE.PointLight;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private lastFpsUpdateTime: number = 0;
  private currentFps: number = 60;
  private totalCycles: number = 0;

  // Camera Orbit & Choreography
  private targetCameraPos = new THREE.Vector3(0, -50, 8);
  private currentCameraPos = new THREE.Vector3(0, -50, 8);
  private targetCameraLookAt = new THREE.Vector3(0, 120, 0);
  private currentCameraLookAt = new THREE.Vector3(0, 120, 0);
  private orbitAngle: number = 0;
  private isPointerDown: boolean = false;
  private pointerStartX: number = 0;
  private pointerStartY: number = 0;
  private freeOrbitTheta: number = 0.5;
  private freeOrbitPhi: number = 1.2;
  private freeOrbitRadius: number = 80;

  // Camera Shake & Beat Impact
  private shakeIntensity: number = 0;
  private shakeOffset = new THREE.Vector3();

  // Surge / Burst state
  private surgeMultiplier: number = 1.0;

  // Boundaries for falling loop
  private readonly topCeilingY = 160;
  private readonly bottomAbyssY = -110;
  private readonly totalFallDistance = 270;

  private onMetricsUpdate?: (metrics: SceneMetrics) => void;

  constructor(
    container: HTMLElement,
    initialConfig: GateConfig,
    onMetricsUpdate?: (metrics: SceneMetrics) => void
  ) {
    this.container = container;
    this.config = { ...initialConfig };
    this.onMetricsUpdate = onMetricsUpdate;

    // 1. Create Canvas & WebGL Renderer
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'w-full h-full block cursor-grab active:cursor-grabbing select-none';
    this.container.appendChild(this.canvas);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    // 2. Scene & Fog
    this.scene = new THREE.Scene();
    const themeColors = getThemeColors(this.config.theme);
    this.scene.background = themeColors.background;
    this.scene.fog = new THREE.FogExp2(themeColors.fog, 0.0055);

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.container.clientWidth / this.container.clientHeight,
      0.5,
      700
    );

    // 4. Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(themeColors.primary, 3.5);
    this.keyLight.position.set(0, 170, 20);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight(themeColors.secondary, 2.5);
    this.fillLight.position.set(-60, 20, 60);
    this.scene.add(this.fillLight);

    this.descentLight = new THREE.PointLight(themeColors.accent, 3.0, 140);
    this.descentLight.position.set(0, 20, 0);
    this.scene.add(this.descentLight);

    // 5. Structure Groups
    this.gateGroup = new THREE.Group();
    this.scene.add(this.gateGroup);

    this.ceilingGroup = new THREE.Group();
    this.scene.add(this.ceilingGroup);

    this.floorGroup = new THREE.Group();
    this.scene.add(this.floorGroup);

    // 6. Build Environment
    this.buildCeilingPortal();
    this.buildFloorAbyss();
    this.buildWarpStreaks();
    this.buildAmbientMist();
    this.rebuildGates();

    // 7. Event Handlers
    this.setupEventListeners();
    this.updateCameraTargets(true);

    // 8. Start Loop
    this.lastTime = performance.now();
    this.lastFpsUpdateTime = performance.now();
    this.animate();
  }

  /**
   * Build the glowing ceiling aperture
   */
  private buildCeilingPortal() {
    this.ceilingGroup.clear();
    const colors = getThemeColors(this.config.theme);

    const irisGeo = new THREE.TorusGeometry(34, 2.4, 16, 64);
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.9,
      roughness: 0.2,
    });
    const iris = new THREE.Mesh(irisGeo, irisMat);
    iris.position.set(0, this.topCeilingY + 2, 0);
    iris.rotation.x = Math.PI / 2;
    this.ceilingGroup.add(iris);

    const glowRingGeo = new THREE.TorusGeometry(35, 0.7, 12, 64);
    const glowRing = new THREE.Mesh(glowRingGeo, new THREE.MeshBasicMaterial({ color: colors.primary }));
    glowRing.position.set(0, this.topCeilingY + 1.8, 0);
    glowRing.rotation.x = Math.PI / 2;
    this.ceilingGroup.add(glowRing);

    const innerRingGeo = new THREE.TorusGeometry(26, 1.4, 12, 48);
    const innerRing = new THREE.Mesh(innerRingGeo, new THREE.MeshBasicMaterial({ color: colors.secondary }));
    innerRing.position.set(0, this.topCeilingY + 1.5, 0);
    innerRing.rotation.x = Math.PI / 2;
    innerRing.name = 'ceilingInnerRing';
    this.ceilingGroup.add(innerRing);

    if (this.config.lightBeams) {
      const coneGeo = new THREE.CylinderGeometry(24, 75, 250, 32, 1, true);
      const coneMat = new THREE.MeshBasicMaterial({
        color: colors.primary,
        transparent: true,
        opacity: 0.09,
        side: THREE.BackSide,
        depthWrite: false,
      });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(0, 45, 0);
      this.ceilingGroup.add(cone);
    }
  }

  private buildFloorAbyss() {
    this.floorGroup.clear();
    const colors = getThemeColors(this.config.theme);

    const gridHelper = new THREE.GridHelper(180, 28, colors.secondary, colors.fog);
    gridHelper.position.set(0, this.bottomAbyssY + 2, 0);
    this.floorGroup.add(gridHelper);

    const rippleGeo = new THREE.RingGeometry(8, 36, 48);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: colors.secondary,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.position.set(0, this.bottomAbyssY + 2.5, 0);
    ripple.rotation.x = Math.PI / 2;
    ripple.name = 'floorRipple';
    this.floorGroup.add(ripple);
  }

  /**
   * Shooting Star / Warp Streak Lines (별똥별 직선 스트릭)
   * High-speed vertical light lines shooting past the camera ("슉슉")
   */
  public buildWarpStreaks() {
    if (this.streakLineSegments) {
      this.scene.remove(this.streakLineSegments);
      this.streakLineSegments.geometry.dispose();
      this.streakLineSegments = null;
    }

    if (!this.config.streakParticles) return;

    this.streakCount = Math.min(1800, Math.max(150, this.config.streakDensity));
    const vertexCount = this.streakCount * 2; // 2 vertices per line
    this.streakPositions = new Float32Array(vertexCount * 3);
    const streakColors = new Float32Array(vertexCount * 3);

    const colors = getThemeColors(this.config.theme);
    const len = this.config.streakLength;

    for (let i = 0; i < this.streakCount; i++) {
      const x = (Math.random() - 0.5) * 120;
      const y = Math.random() * this.totalFallDistance + this.bottomAbyssY;
      const z = (Math.random() - 0.5) * 120;

      // Head vertex
      this.streakPositions[i * 6 + 0] = x;
      this.streakPositions[i * 6 + 1] = y + len;
      this.streakPositions[i * 6 + 2] = z;

      // Tail vertex
      this.streakPositions[i * 6 + 3] = x;
      this.streakPositions[i * 6 + 4] = y;
      this.streakPositions[i * 6 + 5] = z;

      // Head color (bright primary/accent)
      streakColors[i * 6 + 0] = colors.accent.r;
      streakColors[i * 6 + 1] = colors.accent.g;
      streakColors[i * 6 + 2] = colors.accent.b;

      // Tail color (fading secondary)
      streakColors[i * 6 + 3] = colors.primary.r * 0.4;
      streakColors[i * 6 + 4] = colors.primary.g * 0.4;
      streakColors[i * 6 + 5] = colors.primary.b * 0.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.streakPositions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(streakColors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.streakLineSegments = new THREE.LineSegments(geo, mat);
    this.scene.add(this.streakLineSegments);
  }

  private buildAmbientMist() {
    if (this.ambientParticleSystem) {
      this.scene.remove(this.ambientParticleSystem);
      this.ambientParticleSystem.geometry.dispose();
      this.ambientParticleSystem = null;
    }

    if (!this.config.ambientMist) return;

    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * this.totalFallDistance + this.bottomAbyssY;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const themeColors = getThemeColors(this.config.theme);

    const mat = new THREE.PointsMaterial({
      size: 1.5,
      color: themeColors.primary,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.ambientParticleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.ambientParticleSystem);
  }

  /**
   * Build the falling gate instances pool
   */
  public rebuildGates() {
    this.gateGroup.clear();
    this.gates = [];

    const themeColors = getThemeColors(this.config.theme);
    const materials = createGateMaterials(
      themeColors.primary,
      themeColors.secondary,
      themeColors.accent,
      this.config.wireframe
    );

    const count = this.config.gateCount;
    const stepY = this.totalFallDistance / count;

    for (let i = 0; i < count; i++) {
      let chosenStyle: GateStyle = this.config.style;
      if (this.config.mixedStyles) {
        chosenStyle = ALL_STYLES[i % ALL_STYLES.length];
      }

      const gateMesh = buildGateByStyle(chosenStyle, materials);
      const startY = this.topCeilingY - (i * stepY);

      const scaleVar = 1.0 + (Math.sin(i * 1.5) * 0.08);
      const baseScale = this.config.scale * scaleVar;
      gateMesh.scale.set(baseScale, baseScale, baseScale);
      gateMesh.position.set(0, startY, 0);

      this.gateGroup.add(gateMesh);

      this.gates.push({
        group: gateMesh,
        y: startY,
        rotationSpeedY: (Math.random() - 0.5) * 0.15,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.8 + Math.random() * 0.8,
        passedCamera: false,
        scaleVar,
        style: chosenStyle,
      });
    }
  }

  private updateCameraTargets(immediate: boolean = false) {
    switch (this.config.cameraMode) {
      case 'worms_eye':
        this.targetCameraPos.set(0, -68, 6);
        this.targetCameraLookAt.set(0, this.topCeilingY, 0);
        break;

      case 'cinematic':
        const rad = 82;
        this.targetCameraPos.set(
          Math.sin(this.orbitAngle) * rad,
          25 + Math.sin(this.orbitAngle * 0.5) * 15,
          Math.cos(this.orbitAngle) * rad
        );
        this.targetCameraLookAt.set(0, 10, 0);
        break;

      case 'dive_through':
        this.targetCameraPos.set(0, 12, 1);
        this.targetCameraLookAt.set(0, -90, 0);
        break;

      case 'free':
        const x = this.freeOrbitRadius * Math.sin(this.freeOrbitPhi) * Math.sin(this.freeOrbitTheta);
        const y = this.freeOrbitRadius * Math.cos(this.freeOrbitPhi);
        const z = this.freeOrbitRadius * Math.sin(this.freeOrbitPhi) * Math.cos(this.freeOrbitTheta);
        this.targetCameraPos.set(x, y + 10, z);
        this.targetCameraLookAt.set(0, 10, 0);
        break;
    }

    if (immediate) {
      this.currentCameraPos.copy(this.targetCameraPos);
      this.currentCameraLookAt.copy(this.targetCameraLookAt);
      this.camera.position.copy(this.currentCameraPos);
      this.camera.lookAt(this.currentCameraLookAt);
    }
  }

  /**
   * Trigger dynamic high-speed burst / cascade ("게이트 폭포")
   */
  public triggerSurge() {
    this.surgeMultiplier = 3.2;
    this.triggerScreenShake(1.4);
    soundEngine.triggerSurge();

    this.keyLight.intensity = 7.0;
    this.descentLight.intensity = 6.0;
  }

  /**
   * Rhythm Beat / Screen Shake Impact (BOFU Sync)
   */
  public triggerScreenShake(intensity: number = 1.0) {
    this.shakeIntensity = Math.min(2.5, this.shakeIntensity + intensity);
  }

  /**
   * Set manual camera yaw/pitch delta (for live motion recording with mouse/keys)
   */
  public addManualCameraMotion(deltaX: number, deltaY: number) {
    if (this.config.cameraMode === 'free') {
      this.freeOrbitTheta -= deltaX * 0.008;
      this.freeOrbitPhi = Math.max(0.1, Math.min(Math.PI - 0.1, this.freeOrbitPhi - deltaY * 0.008));
    } else {
      this.targetCameraPos.x += deltaX * 0.15;
      this.targetCameraPos.y -= deltaY * 0.15;
    }
  }

  /**
   * Main 60fps animation loop
   */
  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.frameCount++;
    if (now - this.lastFpsUpdateTime >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdateTime));
      this.frameCount = 0;
      this.lastFpsUpdateTime = now;

      if (this.onMetricsUpdate) {
        this.onMetricsUpdate({
          fps: this.currentFps,
          activeGates: this.gates.length,
          fallSpeedUnits: Math.round(this.config.speed * this.surgeMultiplier),
          altitudeOffset: Math.round(this.gates[0]?.y || 0),
          cyclesCount: this.totalCycles,
          currentFov: Math.round(this.camera.fov),
        });
      }
    }

    // Decay surge multiplier smoothly
    if (this.surgeMultiplier > 1.01) {
      this.surgeMultiplier = THREE.MathUtils.lerp(this.surgeMultiplier, 1.0, delta * 1.5);
      this.keyLight.intensity = THREE.MathUtils.lerp(this.keyLight.intensity, 3.5, delta * 3);
      this.descentLight.intensity = THREE.MathUtils.lerp(this.descentLight.intensity, 3.0, delta * 3);
    }

    // 1. Move Falling Gates Downward
    const effectiveSpeed = this.config.speed * this.surgeMultiplier;

    // Motion Blur Y-Stretch multiplier calculation
    let motionBlurStretchY = 1.0;
    if (this.config.motionBlur === 'subtle') {
      motionBlurStretchY = 1.0 + (effectiveSpeed / 200) * 0.35;
    } else if (this.config.motionBlur === 'heavy') {
      motionBlurStretchY = 1.0 + (effectiveSpeed / 150) * 0.85;
    } else if (this.config.motionBlur === 'overdrive') {
      motionBlurStretchY = 1.0 + (effectiveSpeed / 100) * 1.6; // Extreme BOFU stretch!
    }

    for (let i = 0; i < this.gates.length; i++) {
      const gate = this.gates[i];
      gate.y -= effectiveSpeed * delta;

      // Audio Trigger
      if (!gate.passedCamera && gate.y < this.currentCameraPos.y + 4 && gate.y > this.currentCameraPos.y - 14) {
        gate.passedCamera = true;
        soundEngine.triggerGatePass(this.surgeMultiplier * (effectiveSpeed / 40));
      }

      // Recycle at bottom
      if (gate.y < this.bottomAbyssY) {
        gate.y += this.totalFallDistance;
        gate.passedCamera = false;
        this.totalCycles++;
        gate.rotationSpeedY = (Math.random() - 0.5) * 0.15;
      }

      gate.group.position.y = gate.y;

      // Apply Motion Blur scale stretch along Y
      const baseScale = this.config.scale * gate.scaleVar;
      gate.group.scale.set(baseScale, baseScale * motionBlurStretchY, baseScale);

      // Rotational sway
      if (this.config.swayIntensity > 0) {
        gate.swayPhase += gate.swaySpeed * delta;
        gate.group.rotation.x = Math.sin(gate.swayPhase) * 0.05 * this.config.swayIntensity;
        gate.group.rotation.z = Math.cos(gate.swayPhase * 0.8) * 0.04 * this.config.swayIntensity;
      } else {
        gate.group.rotation.x = 0;
        gate.group.rotation.z = 0;
      }

      const portalRing = gate.group.getObjectByName('portalRing');
      if (portalRing) {
        portalRing.rotation.z += 1.2 * delta;
      }
      const innerPortalRing = gate.group.getObjectByName('innerPortalRing');
      if (innerPortalRing) {
        innerPortalRing.rotation.z -= 1.6 * delta;
      }
    }

    // 2. Animate Shooting Star / Warp Streaks (별똥별 직선 스트릭)
    if (this.streakLineSegments) {
      const posArray = this.streakLineSegments.geometry.attributes.position.array as Float32Array;
      const streakTravelSpeed = effectiveSpeed * 1.4;
      const len = this.config.streakLength * (1.0 + effectiveSpeed / 100);

      for (let i = 0; i < this.streakCount; i++) {
        // Move upward relative to downward falling gates
        posArray[i * 6 + 1] += streakTravelSpeed * delta; // Head Y
        posArray[i * 6 + 4] = posArray[i * 6 + 1] - len; // Tail Y

        // Reset if passed above ceiling
        if (posArray[i * 6 + 4] > this.topCeilingY + 15) {
          const newY = this.bottomAbyssY - 10 - Math.random() * 20;
          posArray[i * 6 + 1] = newY + len;
          posArray[i * 6 + 4] = newY;
          // Re-randomize X and Z
          const newX = (Math.random() - 0.5) * 120;
          const newZ = (Math.random() - 0.5) * 120;
          posArray[i * 6 + 0] = newX;
          posArray[i * 6 + 3] = newX;
          posArray[i * 6 + 2] = newZ;
          posArray[i * 6 + 5] = newZ;
        }
      }
      this.streakLineSegments.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Animate Ambient Mist
    if (this.ambientParticleSystem) {
      const positions = this.ambientParticleSystem.geometry.attributes.position.array as Float32Array;
      const mistSpeed = effectiveSpeed * 0.7;
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += mistSpeed * delta;
        if (positions[i * 3 + 1] > this.topCeilingY + 10) {
          positions[i * 3 + 1] = this.bottomAbyssY - 5;
        }
      }
      this.ambientParticleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Animate Ceiling & Floor
    const ceilingInner = this.ceilingGroup.getObjectByName('ceilingInnerRing');
    if (ceilingInner) ceilingInner.rotation.z += 0.5 * delta;

    const floorRipple = this.floorGroup.getObjectByName('floorRipple');
    if (floorRipple) {
      const s = 1.0 + (Math.sin(now * 0.003) * 0.2);
      floorRipple.scale.set(s, s, 1);
    }

    // 5. Dynamic Velocity FOV (Speed Fisheye Distortion for BOFU)
    if (this.config.velocityFov) {
      const targetFov = 60 + Math.min(45, (effectiveSpeed / 200) * 45);
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, delta * 3.5);
      this.camera.updateProjectionMatrix();
    } else if (this.camera.fov !== 60) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, 60, delta * 3.5);
      this.camera.updateProjectionMatrix();
    }

    // 6. Camera Choreography & Screen Shake
    if (this.config.cameraMode === 'cinematic' || (this.config.autoRotateCamera && this.config.cameraMode === 'worms_eye')) {
      this.orbitAngle += delta * 0.35;
    }
    this.updateCameraTargets(false);

    // Screen shake decay
    if (this.shakeIntensity > 0.01) {
      this.shakeOffset.set(
        (Math.random() - 0.5) * this.shakeIntensity * 2.5,
        (Math.random() - 0.5) * this.shakeIntensity * 2.5,
        (Math.random() - 0.5) * this.shakeIntensity * 2.5
      );
      this.shakeIntensity = THREE.MathUtils.lerp(this.shakeIntensity, 0, delta * 5.0);
    } else {
      this.shakeOffset.set(0, 0, 0);
    }

    const lerpSpeed = Math.min(delta * 4.5, 1.0);
    this.currentCameraPos.lerp(this.targetCameraPos, lerpSpeed);
    this.currentCameraLookAt.lerp(this.targetCameraLookAt, lerpSpeed);

    this.camera.position.copy(this.currentCameraPos).add(this.shakeOffset);
    this.camera.lookAt(this.currentCameraLookAt);

    // 7. Render Frame with Motion Blur persistence buffer
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Set configuration dynamically
   */
  public updateConfig(newConfig: Partial<GateConfig>) {
    const prevStyle = this.config.style;
    const prevMixed = this.config.mixedStyles;
    const prevTheme = this.config.theme;
    const prevCount = this.config.gateCount;
    const prevScale = this.config.scale;
    const prevWireframe = this.config.wireframe;
    const prevStreakParticles = this.config.streakParticles;
    const prevStreakDensity = this.config.streakDensity;
    const prevStreakLength = this.config.streakLength;
    const prevAmbientMist = this.config.ambientMist;
    const prevLightBeams = this.config.lightBeams;
    const prevCameraMode = this.config.cameraMode;

    this.config = { ...this.config, ...newConfig };

    if (newConfig.soundEnabled !== undefined) {
      soundEngine.setEnabled(this.config.soundEnabled);
    }
    if (newConfig.soundVolume !== undefined) {
      soundEngine.setVolume(this.config.soundVolume);
    }

    if (
      newConfig.style !== undefined ||
      newConfig.mixedStyles !== undefined ||
      newConfig.theme !== undefined ||
      newConfig.gateCount !== undefined ||
      newConfig.scale !== undefined ||
      newConfig.wireframe !== undefined
    ) {
      const themeColors = getThemeColors(this.config.theme);
      this.scene.background = themeColors.background;
      this.scene.fog = new THREE.FogExp2(themeColors.fog, 0.0055);
      this.keyLight.color = themeColors.primary;
      this.fillLight.color = themeColors.secondary;
      this.descentLight.color = themeColors.accent;

      this.buildCeilingPortal();
      this.buildFloorAbyss();
      this.rebuildGates();
    }

    if (
      newConfig.streakParticles !== undefined ||
      newConfig.streakDensity !== undefined ||
      newConfig.streakLength !== undefined ||
      newConfig.theme !== undefined
    ) {
      this.buildWarpStreaks();
    }

    if (newConfig.ambientMist !== undefined || newConfig.theme !== undefined) {
      this.buildAmbientMist();
    }

    if (newConfig.lightBeams !== undefined) {
      this.buildCeilingPortal();
    }

    if (newConfig.cameraMode !== undefined && newConfig.cameraMode !== prevCameraMode) {
      this.updateCameraTargets(false);
    }
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.onResize);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });

    this.canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    });

    this.canvas.addEventListener('webglcontextrestored', () => {
      this.rebuildGates();
      this.buildWarpStreaks();
      this.lastTime = performance.now();
      this.animate();
    });
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isPointerDown = true;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    const deltaX = e.clientX - this.pointerStartX;
    const deltaY = e.clientY - this.pointerStartY;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;

    this.addManualCameraMotion(deltaX, deltaY);
  };

  private onPointerUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (this.config.cameraMode === 'free') {
      this.freeOrbitRadius = Math.max(15, Math.min(220, this.freeOrbitRadius + e.deltaY * 0.12));
    } else {
      // Dynamic camera zoom in any mode
      this.targetCameraPos.z = Math.max(1, Math.min(60, this.targetCameraPos.z + e.deltaY * 0.05));
    }
  };

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png');
  }

  public destroy() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.canvas.removeEventListener('wheel', this.onWheel);

    this.renderer.dispose();
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
