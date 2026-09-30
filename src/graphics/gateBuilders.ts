import * as THREE from 'three';
import { GateStyle } from '../types/gate';

export interface GateMaterials {
  chassis: THREE.MeshStandardMaterial;
  glowPrimary: THREE.MeshBasicMaterial;
  glowSecondary: THREE.MeshBasicMaterial;
  energyCore: THREE.MeshBasicMaterial;
  metalDark: THREE.MeshStandardMaterial;
  wireframe: THREE.MeshBasicMaterial;
}

export function createGateMaterials(
  primaryColor: THREE.Color,
  secondaryColor: THREE.Color,
  accentColor: THREE.Color,
  wireframe: boolean = false
): GateMaterials {
  return {
    chassis: new THREE.MeshStandardMaterial({
      color: 0x1a202c,
      metalness: 0.85,
      roughness: 0.25,
      wireframe,
    }),
    metalDark: new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.95,
      roughness: 0.15,
      wireframe,
    }),
    glowPrimary: new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe,
    }),
    glowSecondary: new THREE.MeshBasicMaterial({
      color: secondaryColor,
      wireframe,
    }),
    energyCore: new THREE.MeshBasicMaterial({
      color: accentColor,
      transparent: true,
      opacity: 0.85,
      wireframe,
    }),
    wireframe: new THREE.MeshBasicMaterial({
      color: primaryColor,
      wireframe: true,
    }),
  };
}

/**
 * 1. Cyber Quantum Gate: Multi-layer hexagonal cybernetic portal
 */
export function buildCyberGate(materials: GateMaterials): THREE.Group {
  const group = new THREE.Group();
  const width = 24;
  const height = 28;
  const depth = 2.5;

  const pylonGeo = new THREE.BoxGeometry(2.4, height, depth);
  const leftPylon = new THREE.Mesh(pylonGeo, materials.chassis);
  leftPylon.position.set(-width / 2, 0, 0);
  group.add(leftPylon);

  const rightPylon = new THREE.Mesh(pylonGeo, materials.chassis);
  rightPylon.position.set(width / 2, 0, 0);
  group.add(rightPylon);

  const stripGeo = new THREE.BoxGeometry(0.3, height - 2, 0.4);
  const leftStrip = new THREE.Mesh(stripGeo, materials.glowPrimary);
  leftStrip.position.set(-width / 2 + 1.25, 0, depth / 2 + 0.1);
  group.add(leftStrip);

  const rightStrip = new THREE.Mesh(stripGeo, materials.glowPrimary);
  rightStrip.position.set(width / 2 - 1.25, 0, depth / 2 + 0.1);
  group.add(rightStrip);

  const headerGeo = new THREE.BoxGeometry(width + 4, 3.2, depth * 1.2);
  const header = new THREE.Mesh(headerGeo, materials.metalDark);
  header.position.set(0, height / 2, 0);
  group.add(header);

  const headerLightGeo = new THREE.BoxGeometry(width, 0.4, depth * 1.3);
  const headerLight = new THREE.Mesh(headerLightGeo, materials.glowSecondary);
  headerLight.position.set(0, height / 2 + 1.6, 0);
  group.add(headerLight);

  const baseGeo = new THREE.BoxGeometry(width + 4, 2.0, depth * 1.4);
  const base = new THREE.Mesh(baseGeo, materials.metalDark);
  base.position.set(0, -height / 2, 0);
  group.add(base);

  const ringGeo = new THREE.TorusGeometry(8.5, 0.4, 16, 64);
  const ring = new THREE.Mesh(ringGeo, materials.glowPrimary);
  ring.name = 'portalRing';
  group.add(ring);

  const innerRingGeo = new THREE.TorusGeometry(6.5, 0.25, 12, 48);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.glowSecondary);
  innerRing.name = 'innerPortalRing';
  group.add(innerRing);

  // Upward thrusters
  const thrusterGeo = new THREE.CylinderGeometry(0.8, 1.2, 2.0, 16);
  [[-width / 2 - 0.5, height / 2 + 1, 0], [width / 2 + 0.5, height / 2 + 1, 0]].forEach((pos) => {
    const thruster = new THREE.Mesh(thrusterGeo, materials.metalDark);
    thruster.position.set(pos[0], pos[1], pos[2]);
    group.add(thruster);
  });

  return group;
}

/**
 * 2. Neo Torii Shrine Gate
 */
export function buildToriiGate(materials: GateMaterials): THREE.Group {
  const group = new THREE.Group();
  const width = 26;
  const height = 26;
  const columnRadius = 1.3;

  const pillarGeo = new THREE.CylinderGeometry(columnRadius * 0.85, columnRadius, height, 24);
  const leftPillar = new THREE.Mesh(pillarGeo, materials.glowSecondary);
  leftPillar.position.set(-width / 2 + 2, 0, 0);
  leftPillar.rotation.z = -0.04;
  group.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, materials.glowSecondary);
  rightPillar.position.set(width / 2 - 2, 0, 0);
  rightPillar.rotation.z = 0.04;
  group.add(rightPillar);

  const baseGeo = new THREE.CylinderGeometry(2.0, 2.4, 2.0, 16);
  const leftBase = new THREE.Mesh(baseGeo, materials.metalDark);
  leftBase.position.set(-width / 2 + 2, -height / 2, 0);
  group.add(leftBase);

  const rightBase = new THREE.Mesh(baseGeo, materials.metalDark);
  rightBase.position.set(width / 2 - 2, -height / 2, 0);
  group.add(rightBase);

  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-width / 2 - 5, height / 2 + 1.5, 0),
    new THREE.Vector3(0, height / 2 - 0.5, 0),
    new THREE.Vector3(width / 2 + 5, height / 2 + 1.5, 0)
  );
  const kasagiGeo = new THREE.TubeGeometry(curve, 32, 1.4, 12, false);
  const kasagi = new THREE.Mesh(kasagiGeo, materials.chassis);
  group.add(kasagi);

  const crestCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-width / 2 - 4.8, height / 2 + 2.5, 0),
    new THREE.Vector3(0, height / 2 + 0.6, 0),
    new THREE.Vector3(width / 2 + 4.8, height / 2 + 2.5, 0)
  );
  const crestGeo = new THREE.TubeGeometry(crestCurve, 32, 0.35, 8, false);
  const crest = new THREE.Mesh(crestGeo, materials.glowPrimary);
  group.add(crest);

  const nukiGeo = new THREE.BoxGeometry(width + 2, 1.4, 2.2);
  const nuki = new THREE.Mesh(nukiGeo, materials.metalDark);
  nuki.position.set(0, height / 2 - 4.2, 0);
  group.add(nuki);

  const haloGeo = new THREE.TorusGeometry(7.0, 0.25, 16, 64);
  const halo = new THREE.Mesh(haloGeo, materials.glowPrimary);
  halo.name = 'portalRing';
  group.add(halo);

  return group;
}

/**
 * 3. Brutalist Monolith Arch
 */
export function buildMonolithGate(materials: GateMaterials): THREE.Group {
  const group = new THREE.Group();
  const width = 28;
  const height = 30;
  const depth = 4.5;

  const colGeo = new THREE.BoxGeometry(4.5, height, depth);
  const leftCol = new THREE.Mesh(colGeo, materials.chassis);
  leftCol.position.set(-width / 2, 0, 0);
  group.add(leftCol);

  const rightCol = new THREE.Mesh(colGeo, materials.chassis);
  rightCol.position.set(width / 2, 0, 0);
  group.add(rightCol);

  const slitGeo = new THREE.BoxGeometry(0.4, height * 0.8, 0.4);
  const leftSlit = new THREE.Mesh(slitGeo, materials.glowPrimary);
  leftSlit.position.set(-width / 2, 0, depth / 2 + 0.1);
  group.add(leftSlit);

  const rightSlit = new THREE.Mesh(slitGeo, materials.glowPrimary);
  rightSlit.position.set(width / 2, 0, depth / 2 + 0.1);
  group.add(rightSlit);

  const lintelGeo = new THREE.BoxGeometry(width + 9, 6.0, depth * 1.3);
  const lintel = new THREE.Mesh(lintelGeo, materials.metalDark);
  lintel.position.set(0, height / 2 + 1.0, 0);
  group.add(lintel);

  const octRimGeo = new THREE.TorusGeometry(8.2, 0.35, 8, 8);
  const octRim = new THREE.Mesh(octRimGeo, materials.glowPrimary);
  octRim.name = 'portalRing';
  group.add(octRim);

  return group;
}

/**
 * 4. Astral Stargate Ring
 */
export function buildAstralGate(materials: GateMaterials): THREE.Group {
  const group = new THREE.Group();
  const radius = 13;

  const outerRingGeo = new THREE.TorusGeometry(radius, 1.2, 24, 72);
  const outerRing = new THREE.Mesh(outerRingGeo, materials.chassis);
  group.add(outerRing);

  const outerRimGeo = new THREE.TorusGeometry(radius + 1.3, 0.25, 16, 72);
  const outerRim = new THREE.Mesh(outerRimGeo, materials.glowPrimary);
  group.add(outerRim);

  const chevronGeo = new THREE.BoxGeometry(2.0, 3.2, 1.8);
  const numChevrons = 9;
  for (let i = 0; i < numChevrons; i++) {
    const angle = (i / numChevrons) * Math.PI * 2;
    const chevron = new THREE.Mesh(chevronGeo, materials.metalDark);
    chevron.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    chevron.rotation.z = angle;
    group.add(chevron);

    const lightGeo = new THREE.BoxGeometry(0.8, 1.4, 2.0);
    const light = new THREE.Mesh(lightGeo, materials.glowSecondary);
    light.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    light.rotation.z = angle;
    group.add(light);
  }

  const innerRingGeo = new THREE.TorusGeometry(radius - 2.8, 0.6, 16, 64);
  const innerRing = new THREE.Mesh(innerRingGeo, materials.glowPrimary);
  innerRing.name = 'portalRing';
  group.add(innerRing);

  return group;
}

/**
 * 5. NEW: Hyper Prism / Neon Diamond (다이아몬드 프리즘 게이트)
 * Sharp 45-degree angled concentric rhombus portal with refractive laser beams
 */
export function buildPrismGate(materials: GateMaterials): THREE.Group {
  const group = new THREE.Group();
  const size = 20;

  // Outer diamond frame (4 connected struts)
  const strutGeo = new THREE.BoxGeometry(size * 1.414, 1.8, 2.0);
  const strutLightGeo = new THREE.BoxGeometry(size * 1.38, 0.4, 2.2);

  const offsets = [
    { pos: [0, size / 2, 0], rot: Math.PI / 4 },
    { pos: [0, -size / 2, 0], rot: -Math.PI / 4 },
    { pos: [0, size / 2, 0], rot: -Math.PI / 4 },
    { pos: [0, -size / 2, 0], rot: Math.PI / 4 },
  ];

  // Diamond outer chassis
  const diamondOuter = new THREE.Group();
  offsets.forEach((o) => {
    const strut = new THREE.Mesh(strutGeo, materials.chassis);
    strut.position.set(o.pos[0], o.pos[1], o.pos[2]);
    strut.rotation.z = o.rot;
    diamondOuter.add(strut);

    const light = new THREE.Mesh(strutLightGeo, materials.glowPrimary);
    light.position.set(o.pos[0], o.pos[1], o.pos[2]);
    light.rotation.z = o.rot;
    diamondOuter.add(light);
  });
  group.add(diamondOuter);

  // Inner floating prism core
  const innerSize = size * 0.55;
  const innerStrutGeo = new THREE.BoxGeometry(innerSize * 1.414, 1.0, 1.5);
  const innerDiamond = new THREE.Group();
  offsets.forEach((o) => {
    const s = new THREE.Mesh(innerStrutGeo, materials.glowSecondary);
    s.position.set(o.pos[0] * 0.55, o.pos[1] * 0.55, o.pos[2]);
    s.rotation.z = o.rot;
    innerDiamond.add(s);
  });
  innerDiamond.name = 'portalRing';
  group.add(innerDiamond);

  // Central floating laser octahedron
  const octGeo = new THREE.OctahedronGeometry(4.0);
  const octCore = new THREE.Mesh(octGeo, materials.energyCore);
  octCore.name = 'innerPortalRing';
  group.add(octCore);

  return group;
}

/**
 * 6. NEW: Cyber Gothic Cathedral Arch (사이버 고딕 성당 아치)
 * Pointed Gothic spire arch with luminous rosette energy window
 */
export function buildGothicGate(materials: GateMaterials): THREE.Group {
  const group = new THREE.Group();
  const width = 24;
  const height = 30;

  // Twin clustered gothic spire pillars
  const pillarGeo = new THREE.CylinderGeometry(1.2, 1.6, height, 12);
  const leftPillar = new THREE.Mesh(pillarGeo, materials.chassis);
  leftPillar.position.set(-width / 2, 0, 0);
  group.add(leftPillar);

  const rightPillar = new THREE.Mesh(pillarGeo, materials.chassis);
  rightPillar.position.set(width / 2, 0, 0);
  group.add(rightPillar);

  // Vertical light ribs on pillars
  const ribGeo = new THREE.BoxGeometry(0.3, height - 2, 0.4);
  const leftRib = new THREE.Mesh(ribGeo, materials.glowPrimary);
  leftRib.position.set(-width / 2, 0, 1.4);
  group.add(leftRib);

  const rightRib = new THREE.Mesh(ribGeo, materials.glowPrimary);
  rightRib.position.set(width / 2, 0, 1.4);
  group.add(rightRib);

  // Left Pointed Arch curve
  const leftCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-width / 2, height / 2, 0),
    new THREE.Vector3(-width / 4, height / 2 + 10, 0),
    new THREE.Vector3(0, height / 2 + 8, 0)
  );
  const leftArch = new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 20, 1.2, 8, false), materials.chassis);
  group.add(leftArch);

  // Right Pointed Arch curve
  const rightCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(width / 2, height / 2, 0),
    new THREE.Vector3(width / 4, height / 2 + 10, 0),
    new THREE.Vector3(0, height / 2 + 8, 0)
  );
  const rightArch = new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 20, 1.2, 8, false), materials.chassis);
  group.add(rightArch);

  // Pointed glowing tip crest
  const crestGeo = new THREE.ConeGeometry(1.4, 4.5, 8);
  const crest = new THREE.Mesh(crestGeo, materials.glowSecondary);
  crest.position.set(0, height / 2 + 10, 0);
  group.add(crest);

  // Luminous Rose Window (중앙 장미 문양 발광 링)
  const roseGeo = new THREE.TorusGeometry(6.5, 0.35, 12, 48);
  const rose = new THREE.Mesh(roseGeo, materials.glowPrimary);
  rose.position.set(0, 3, 0);
  rose.name = 'portalRing';
  group.add(rose);

  // Radial rose spokes
  for (let i = 0; i < 8; i++) {
    const spokeAngle = (i / 8) * Math.PI * 2;
    const spokeGeo = new THREE.BoxGeometry(0.3, 6.0, 0.3);
    const spoke = new THREE.Mesh(spokeGeo, materials.glowSecondary);
    spoke.position.set(Math.cos(spokeAngle) * 3, 3 + Math.sin(spokeAngle) * 3, 0);
    spoke.rotation.z = spokeAngle + Math.PI / 2;
    group.add(spoke);
  }

  return group;
}

/**
 * 7. NEW: Glitch / Binary Voxel Gate (글리치 복셀 아치)
 * Asymmetric cyberpunk floating data cubes in arch formation
 */
export function buildVoxelGate(materials: GateMaterials): THREE.Group {
  const group = new THREE.Group();
  const voxelSize = 2.4;

  // Discrete voxel positions for left pillar, right pillar, and top lintel
  const voxelPositions: [number, number, number, boolean][] = [
    // Left pillar voxels
    [-11, -12, 0, false],
    [-11, -9, 0.6, true],
    [-11, -6, -0.4, false],
    [-11, -3, 0, false],
    [-11, 0, 0.8, true],
    [-11, 3, 0, false],
    [-11, 6, -0.6, true],
    [-11, 9, 0, false],
    [-11, 12, 0.4, true],
    // Right pillar voxels
    [11, -12, 0, false],
    [11, -9, -0.5, true],
    [11, -6, 0.3, false],
    [11, -3, 0, false],
    [11, 0, -0.7, true],
    [11, 3, 0.5, false],
    [11, 6, 0, true],
    [11, 9, -0.4, false],
    [11, 12, 0.3, true],
    // Top crossbeam voxels
    [-8, 12, 0, false],
    [-5, 12.8, 0.5, true],
    [-2, 12, 0, false],
    [0, 13.5, 0.8, true],
    [2, 12, 0, false],
    [5, 12.6, -0.5, true],
    [8, 12, 0, false],
  ];

  const cubeGeo = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize);
  voxelPositions.forEach(([x, y, z, isGlowing]) => {
    const cube = new THREE.Mesh(cubeGeo, isGlowing ? materials.glowPrimary : materials.chassis);
    cube.position.set(x, y, z);
    group.add(cube);
  });

  // Floating inner holographic data cross
  const coreH = new THREE.BoxGeometry(10, 0.6, 0.6);
  const coreV = new THREE.BoxGeometry(0.6, 10, 0.6);
  const crossGroup = new THREE.Group();
  crossGroup.add(new THREE.Mesh(coreH, materials.glowSecondary));
  crossGroup.add(new THREE.Mesh(coreV, materials.glowSecondary));
  crossGroup.name = 'portalRing';
  group.add(crossGroup);

  return group;
}

/**
 * 8. NEW: Hyper-Speed Warp Ring (워프 터널 가속기 링)
 * Concentric high-speed collider ring with radial aerodynamic fins
 */
export function buildWarpRingGate(materials: GateMaterials): THREE.Group {
  const group = new THREE.Group();
  const radius = 14;

  // Massive heavy toroidal accelerator tunnel
  const ringGeo = new THREE.TorusGeometry(radius, 1.8, 24, 64);
  const ring = new THREE.Mesh(ringGeo, materials.chassis);
  group.add(ring);

  // Twin glowing perimeter rings
  const rim1 = new THREE.Mesh(new THREE.TorusGeometry(radius + 1.8, 0.25, 12, 64), materials.glowPrimary);
  rim1.position.z = 0.8;
  group.add(rim1);

  const rim2 = new THREE.Mesh(new THREE.TorusGeometry(radius + 1.8, 0.25, 12, 64), materials.glowSecondary);
  rim2.position.z = -0.8;
  group.add(rim2);

  // 12 Aerodynamic Hyperdrive Fins around outer ring
  const finGeo = new THREE.BoxGeometry(1.4, 4.5, 3.2);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const fin = new THREE.Mesh(finGeo, materials.metalDark);
    fin.position.set(Math.cos(angle) * (radius + 1.5), Math.sin(angle) * (radius + 1.5), 0);
    fin.rotation.z = angle;
    group.add(fin);

    const finGlow = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4.0, 3.4), materials.glowPrimary);
    finGlow.position.set(Math.cos(angle) * (radius + 1.5), Math.sin(angle) * (radius + 1.5), 0);
    finGlow.rotation.z = angle;
    group.add(finGlow);
  }

  // Inner vortex aperture iris
  const innerRing = new THREE.Mesh(new THREE.TorusGeometry(radius - 3.2, 0.5, 16, 48), materials.glowSecondary);
  innerRing.name = 'portalRing';
  group.add(innerRing);

  return group;
}

export function buildGateByStyle(style: GateStyle, materials: GateMaterials): THREE.Group {
  switch (style) {
    case 'torii':
      return buildToriiGate(materials);
    case 'monolith':
      return buildMonolithGate(materials);
    case 'astral':
      return buildAstralGate(materials);
    case 'prism':
      return buildPrismGate(materials);
    case 'gothic':
      return buildGothicGate(materials);
    case 'voxel':
      return buildVoxelGate(materials);
    case 'warp_ring':
      return buildWarpRingGate(materials);
    case 'cyber':
    default:
      return buildCyberGate(materials);
  }
}
