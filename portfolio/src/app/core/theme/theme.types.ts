export type ThemeId = 'v3-dark' | 'v2' | 'v3-mono';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  description: string;
  route: string;
  isDefault: boolean;
  hasTopology: boolean;
}
