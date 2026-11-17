// Design tokens — mirrors Phase 3 UI/UX palette and tailwind.config.js.
// Kept as a JS object too because some RN components (ActivityIndicator, etc.)
// take literal color values rather than className strings.
export const colors = {
  primary: '#0B3D2E',
  primaryLight: '#0F6E56',
  accent: '#E8B84B',
  surface: '#FAFAF8',
  surfaceCard: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B66',
  border: '#E2E0D5',
  success: '#0F6E56',
  warning: '#E8B84B',
  danger: '#A32D2D',
} as const;
