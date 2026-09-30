import * as THREE from 'three';
import { ColorTheme, ThemeColors } from '../types/gate';

export const THEMES: Record<ColorTheme, ThemeColors> = {
  cyber: {
    primary: '#00f0ff',      // Neon Cyan
    secondary: '#ff007f',    // Hot Magenta
    accent: '#7928ca',       // Electric Purple
    emissive: '#00f0ff',     // Cyan glow
    ambient: '#0d1117',      // Deep space
    fog: '#060810',          // Dark void
    background: '#04060a',
  },
  bofu_neon: {
    primary: '#ff0055',      // Acid Crimson
    secondary: '#00f6ff',    // Strobe Cyan
    accent: '#ffe600',       // Electric Yellow
    emissive: '#ff0055',
    ambient: '#120516',
    fog: '#08010d',
    background: '#040008',
  },
  solar: {
    primary: '#ffaa00',      // Solar Gold
    secondary: '#ff4400',    // Solar Flare Orange
    accent: '#ffdd66',       // White-hot gold
    emissive: '#ff8800',     // Amber glow
    ambient: '#140c06',
    fog: '#0c0704',
    background: '#080503',
  },
  void: {
    primary: '#f8fafc',      // Platinum White
    secondary: '#64748b',    // Slate Steel
    accent: '#38bdf8',       // Crisp Ice Blue
    emissive: '#f8fafc',     // Pure Bright White
    ambient: '#0b0f19',
    fog: '#030508',
    background: '#020305',
  },
  aurora: {
    primary: '#10b981',      // Emerald Green
    secondary: '#06b6d4',    // Cyan Teal
    accent: '#34d399',       // Mint
    emissive: '#059669',     // Deep Emerald glow
    ambient: '#04130f',
    fog: '#020b08',
    background: '#010604',
  },
};

export function getThemeColors(themeName: ColorTheme): {
  primary: THREE.Color;
  secondary: THREE.Color;
  accent: THREE.Color;
  emissive: THREE.Color;
  fog: THREE.Color;
  background: THREE.Color;
} {
  const theme = THEMES[themeName] || THEMES.cyber;
  return {
    primary: new THREE.Color(theme.primary),
    secondary: new THREE.Color(theme.secondary),
    accent: new THREE.Color(theme.accent),
    emissive: new THREE.Color(theme.emissive),
    fog: new THREE.Color(theme.fog),
    background: new THREE.Color(theme.background),
  };
}
