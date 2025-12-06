// Archivo: src/app/app.routes.ts

import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './guards/auth-guard';
import { VisitanteGuard } from './guards/visitante-guard';

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
    // ✅ Solo admins pueden acceder a las tabs
    canActivate: [
      () => inject(AuthGuard).canActivate(),
      () => inject(VisitanteGuard).canActivate()
    ]
  },
  {
    path: 'rutas',
    loadComponent: () => import('./rutas/rutas.page').then(m => m.CrearRutaComponent),
    // ✅ Solo admins pueden crear rutas
    canActivate: [
      () => inject(AuthGuard).canActivate(),
      () => inject(VisitanteGuard).canActivate()
    ]
  },
  {
    path: 'mapa-vehiculos',
    loadComponent: () => import('./components/mapa-vehiculos/mapa-vehiculos').then(m => m.MapaVehiculosPage),
    // ✅ Todos los usuarios autenticados pueden ver el mapa
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
