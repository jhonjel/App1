// Archivo: src/app/guards/interceptor-guard.ts

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  console.log('🔐 Interceptor - URL:', req.url);

  // Agregar token a peticiones de la API
  if (req.url.includes('apirecoleccion.gonzaloandreslucio.com')) {
    console.log('✅ URL de API detectada, agregando token...');

    return from(authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          console.log('🔑 Token obtenido, clonando request...');
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          console.log('✅ Headers agregados:', req.headers.keys());
        } else {
          console.warn('⚠️ No se pudo obtener el token');
        }
        return next(req);
      })
    );
  }

  console.log('ℹ️ URL externa, sin token');
  return next(req);
};
