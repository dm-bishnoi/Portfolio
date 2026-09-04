import {
  Component,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/theme/theme.service';
import { THEMES, type ThemeId } from '../../../core/theme/theme.registry';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav
      class="theme-switcher"
      aria-label="Portfolio theme"
      role="navigation"
    >
      @for (theme of themes; track theme.id) {
        <a
          [routerLink]="theme.route"
          [queryParams]="{ theme: theme.id }"
          [attr.data-theme]="theme.id"
          [attr.aria-label]="'Switch to ' + theme.label"
          [attr.aria-current]="isActive(theme.id) ? 'true' : null"
          class="theme-pill"
          [class.is-active]="isActive(theme.id)"
        >
          <span class="theme-pill-label">{{ theme.label }}</span>
          <span class="theme-pill-desc">{{ theme.description }}</span>
        </a>
      }
    </nav>
  `,
  styles: [
    `
      .theme-switcher {
        position: fixed;
        right: clamp(12px, 2vw, 24px);
        bottom: clamp(12px, 2vw, 24px);
        z-index: 9000;
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 4px;
        border-radius: 999px;
        background: rgba(20, 20, 24, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(14px) saturate(140%);
        -webkit-backdrop-filter: blur(14px) saturate(140%);
        box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.4);
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 11px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.7);
      }

      .theme-pill {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1px;
        padding: 8px 14px;
        min-width: 56px;
        border-radius: 999px;
        color: inherit;
        text-decoration: none;
        text-align: center;
        line-height: 1.05;
        transition: color 200ms ease, background 200ms ease;
        white-space: nowrap;
      }

      .theme-pill:hover {
        color: #fff;
      }

      .theme-pill-label {
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.16em;
      }

      .theme-pill-desc {
        font-size: 8px;
        letter-spacing: 0.12em;
        opacity: 0;
        max-height: 0;
        overflow: hidden;
        transition: opacity 200ms ease, max-height 200ms ease;
      }

      .theme-pill:hover .theme-pill-desc {
        opacity: 0.6;
        max-height: 14px;
      }

      .theme-pill.is-active {
        background: #A855F7;
        color: #fff;
        box-shadow: 0 4px 20px -4px rgba(168, 85, 247, 0.55);
      }

      .theme-pill.is-active .theme-pill-desc {
        opacity: 0.85;
        max-height: 14px;
      }

      .theme-pill:focus-visible {
        outline: 2px solid #A855F7;
        outline-offset: 3px;
      }

      @media (max-width: 520px) {
        .theme-switcher {
          font-size: 10px;
          gap: 0;
        }
        .theme-pill {
          padding: 7px 10px;
          min-width: 0;
        }
        .theme-pill-desc {
          display: none;
        }
        .theme-pill.is-active .theme-pill-desc {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .theme-pill,
        .theme-pill-desc {
          transition: none !important;
        }
      }
    `,
  ],
})
export class ThemeSwitcherComponent {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly themes = THEMES;

  isActive(id: ThemeId): boolean {
    return this.themeService.isActive(id);
  }
}
