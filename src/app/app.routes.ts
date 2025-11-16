import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then(m => m.routes),
    canActivate: [() => inject(AuthGuard).canActivate()]   // ← CORREGIDO
  },
  {
    path: 'rutas',
    loadComponent: () => import('./rutas/rutas.page').then(m => m.CrearRutaComponent)
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

