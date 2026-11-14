/** Available color themes and their UI metadata for the settings picker. */
export type ThemeId =
  | 'lavender-light'
  | 'mint-fresh'
  | 'sky-blue'
  | 'lavender-night'
  | 'forest-night'
  | 'midnight-blue';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  kind: 'light' | 'dark';
  /** hex swatches for the picker preview: page bg, card, accent */
  preview: { canvas: string; card: string; accent: string };
}

export const DEFAULT_THEME: ThemeId = 'lavender-light';

export const THEMES: ThemeMeta[] = [
  {
    id: 'lavender-light',
    name: 'Lavender Light',
    kind: 'light',
    preview: { canvas: '#F6F5FB', card: '#FFFFFF', accent: '#6C63FF' },
  },
  {
    id: 'mint-fresh',
    name: 'Mint Fresh',
    kind: 'light',
    preview: { canvas: '#F0F9F5', card: '#FFFFFF', accent: '#129E80' },
  },
  {
    id: 'sky-blue',
    name: 'Sky Blue',
    kind: 'light',
    preview: { canvas: '#F0F6FD', card: '#FFFFFF', accent: '#3B82F6' },
  },
  {
    id: 'lavender-night',
    name: 'Lavender Night',
    kind: 'dark',
    preview: { canvas: '#1C182A', card: '#28233A', accent: '#7C6AEE' },
  },
  {
    id: 'forest-night',
    name: 'Forest Night',
    kind: 'dark',
    preview: { canvas: '#141E1A', card: '#1E2D26', accent: '#22A87C' },
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    kind: 'dark',
    preview: { canvas: '#0E192C', card: '#17263E', accent: '#4C8FF0' },
  },
];
