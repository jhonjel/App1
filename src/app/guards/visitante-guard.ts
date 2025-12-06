// Archivo: src/app/guards/visitante.guard.ts
// Guard para restringir acceso de visitantes solo al mapa

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VisitanteGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate() {
    return this.authService.usuarioObservable.pipe(
      take(1),
      map(user => {
        if (!user) {
          // Si no está autenticado, redirigir al login
          this.router.navigate(['/login']);
          return false;
        }

        const rol = this.authService.getRole();

        if (rol === 'visitante') {
          // Los visitantes solo pueden acceder al mapa
          this.router.navigate(['/mapa-vehiculos']);
          return false;
        }

        // Los admins pueden acceder
        return true;
      })
    );
  }
}
