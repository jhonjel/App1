import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Si la petición es al servidor local de autenticación, agregar el token
  if (req.url.includes('localhost:3000')) {
    const token = authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  // Para las otras APIs (como la de vehículos), mantener la autorización original

  return next(req);
};
