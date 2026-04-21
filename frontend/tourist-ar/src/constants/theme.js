import { Platform } from 'react-native';

export const colors = {
  bg: '#07070a',
  bgDeep: '#000000',
  panel: 'rgba(10, 14, 22, 0.92)',
  panelSolid: '#0c1017',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  accent: '#5EFCCF',
  accentDim: 'rgba(94,252,207,0.18)',
  text: '#F2F5F7',
  textDim: 'rgba(235,238,245,0.62)',
  textMuted: 'rgba(235,238,245,0.38)',
  warn: '#FFB26B',
  danger: '#FF6B8B',
};

export const fonts = {
  mono: Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' }),
  display: Platform.select({ ios: 'AvenirNext-Heavy', android: 'sans-serif-condensed', default: 'System' }),
  body: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
};
