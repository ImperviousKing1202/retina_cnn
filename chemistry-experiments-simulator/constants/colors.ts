const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const FuturisticColors = {
  neonBlue: '#00F0FF',
  neonPink: '#FF006E',
  neonPurple: '#8B5CF6',
  neonGreen: '#00FF94',
  neonYellow: '#FFD60A',
  darkBg: '#0A0E27',
  darkCard: '#1A1F3A',
  glowBlue: '#4CC9F0',
  glowPurple: '#7209B7',
  glowPink: '#F72585',
  holographic: ['#00F0FF', '#8B5CF6', '#FF006E', '#FFD60A'],
  gradients: {
    general: ['#4361EE', '#3A0CA3', '#7209B7'] as const,
    biochemistry: ['#06FFA5', '#00D9FF', '#4CC9F0'] as const,
    organic: ['#FF006E', '#F72585', '#B5179E'] as const,
    analytical: ['#FFD60A', '#FCA311', '#F48C06'] as const,
  },
};

export default Colors;