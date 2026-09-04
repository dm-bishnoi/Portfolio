import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'v3-dark',
    loadComponent: () =>
      import('./features/themes/v3-dark/v3-dark.component').then((m) => m.V3DarkComponent),
  },
  {
    path: 'v3-mono',
    loadComponent: () =>
      import('./features/themes/v3-mono/v3-mono.component').then((m) => m.V3MonoComponent),
  },
  {
    path: 'v2',
    loadComponent: () =>
      import('./features/themes/v2/v2.component').then((m) => m.V2Component),
  },
  {
    path: '**',
    redirectTo: 'v3-dark',
    pathMatch: 'full',
  },
];
