// Archivo: src/app/app.routes.ts

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
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: 'rutas',
    loadComponent: () => import('./rutas/rutas.page').then(m => m.CrearRutaComponent),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  // 🆕 NUEVA RUTA PARA MAPA DE VEHÍCULOS
  {
    path: 'mapa-vehiculos',
    loadComponent: () => import('./components/mapa-vehiculos/mapa-vehiculos').then(m => m.MapaVehiculosPage),
    canActivate: [() => inject(AuthGuard).canActivate()]
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
