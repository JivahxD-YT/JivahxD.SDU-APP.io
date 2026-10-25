import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.component').then((module) => module.HomeComponent)
  },
  {
    path: 'denunciar',
    loadComponent: () => import('./pages/report.component').then((module) => module.ReportComponent)
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/login.component').then((module) => module.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard.component').then((module) => module.DashboardComponent)
  },
  { path: '**', redirectTo: '' }
];
