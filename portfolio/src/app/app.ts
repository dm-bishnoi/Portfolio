import { Component, computed, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme/theme.service';
import { ThemeSwitcherComponent } from './features/shared/theme-switcher/theme-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThemeSwitcherComponent],
  template: `
    <router-outlet />
    <app-theme-switcher />
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }
    `,
  ],
})
export class App {
  private readonly themeService = inject(ThemeService);

  readonly currentTheme = computed(() => this.themeService.activeTheme());

  constructor() {
    effect(() => {
      const themeId = this.themeService.activeTheme();
      document.documentElement.classList.remove('v3-dark-theme', 'v2-theme', 'v3-mono-theme');
      document.documentElement.classList.add(`${themeId}-theme`);
    });
  }
}
