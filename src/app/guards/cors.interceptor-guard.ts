// Archivo: src/app/guards/cors.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const corsInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Agregar token de autenticación
  const token = authService.getToken();

  let headers = req.headers
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json');

  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
    console.log('✅ Token agregado');
  }

  // Para APIs externas, agregar headers CORS
  if (req.url.includes('apirecoleccion.gonzaloandreslucio.com')) {
    console.log('🌐 Petición a API externa, configurando CORS');

    headers = headers
      .set('Access-Control-Allow-Origin', '*')
      .set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      .set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  const clonedRequest = req.clone({ headers });

  return next(clonedRequest);
};
