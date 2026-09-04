import type { ThemeConfig, ThemeId } from './theme.types';

export type { ThemeId };

export const THEMES: ThemeConfig[] = [
  {
    id: 'v3-dark',
    label: 'V3 Dark',
    description: 'Dark, scroll-driven 3D',
    route: 'v3-dark',
    isDefault: true,
    hasTopology: true,
  },
  {
    id: 'v3-mono',
    label: 'V3 Mono',
    description: 'White, editorial',
    route: 'v3-mono',
    isDefault: false,
    hasTopology: false,
  },
  {
    id: 'v2',
    label: 'V2',
    description: 'Particle sphere',
    route: 'v2',
    isDefault: false,
    hasTopology: false,
  },
];

export const THEME_BY_ID = Object.fromEntries(
  THEMES.map((t) => [t.id, t])
) as Record<ThemeId, ThemeConfig>;

export function getThemeById(id: string): ThemeConfig | null {
  return (THEME_BY_ID[id as ThemeId]) ?? null;
}

export function defaultThemeId(): ThemeId {
  const def = THEMES.find((t) => t.isDefault);
  return def ? def.id : THEMES[0].id;
}
