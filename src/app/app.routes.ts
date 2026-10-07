import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: 'registro', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: '', redirectTo: 'registro', pathMatch: 'full' },
  { path: '**', redirectTo: 'registro' }
];
