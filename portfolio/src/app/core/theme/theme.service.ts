import { Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { defaultThemeId, getThemeById } from './theme.registry';
import type { ThemeId } from './theme.types';

const STORAGE_KEY = 'portfolio.theme';
const LEGACY_KEY = 'portfolio.version';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly subject = new BehaviorSubject<ThemeId>(defaultThemeId());
  readonly theme$ = this.subject.asObservable();
  readonly activeTheme = toSignal(this.subject, { initialValue: defaultThemeId() });

  constructor() {
    const resolved = this.resolveTheme();
    this.subject.next(resolved);
  }

  switchTheme(id: ThemeId): void {
    if (!getThemeById(id)) return;
    this.subject.next(id);
    this.persist(id);
    this.updateUrl(id);
  }

  isActive(id: ThemeId): boolean {
    return this.subject.value === id;
  }

  private resolveTheme(): ThemeId {
    const deep = this.readDeepLink();
    if (deep) {
      this.persist(deep);
      return deep;
    }
    const stored = this.readStored();
    if (stored) return stored;
    return defaultThemeId();
  }

  private readStored(): ThemeId | null {
    try {
      const val = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
      if (val && getThemeById(val)) return val as ThemeId;
    } catch {
      // localStorage unavailable
    }
    return null;
  }

  private persist(id: ThemeId): void {
    try {
      localStorage.setItem(STORAGE_KEY, id);
      try {
        localStorage.removeItem(LEGACY_KEY);
      } catch {
        // ignore
      }
    } catch {
      // localStorage unavailable
    }
  }

  private readDeepLink(): ThemeId | null {
    try {
      const hashParams = new URLSearchParams(location.hash.slice(1));
      const themeParam = hashParams.get('theme');
      if (themeParam && getThemeById(themeParam)) return themeParam as ThemeId;
    } catch {
      // URL parsing failed
    }
    return null;
  }

  private updateUrl(id: ThemeId): void {
    try {
      const url = new URL(location.href);
      url.searchParams.set('theme', id);
      history.replaceState(null, '', url.toString());
    } catch {
      // URL update failed
    }
  }
}
