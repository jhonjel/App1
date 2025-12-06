import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    FormsModule,
    CommonModule
  ]
})
export class LoginPage {

  email: string = '';
  password: string = '';
  error: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  async login() {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.error = 'Email inválido';
      return;
    }

    this.cargando = true;

    try {
      await this.authService.login(this.email, this.password);
      this.cargando = false;

      // ✅ Redirigir según el rol del usuario
      const rol = this.authService.getRole();
      console.log('👤 Rol detectado:', rol);

      if (rol === 'visitante') {
        console.log('➡️ Redirigiendo a mapa (visitante)');
        this.router.navigate(['/mapa-vehiculos']);
      } else {
        console.log('➡️ Redirigiendo a tabs (admin)');
        this.router.navigate(['/tabs/tab1']);
      }

    } catch (err: any) {
      this.cargando = false;

      // Mensajes de error amigables
      switch (err?.code) {
        case 'auth/user-not-found':
          this.error = 'No existe una cuenta con este email';
          break;
        case 'auth/wrong-password':
          this.error = 'Contraseña incorrecta';
          break;
        case 'auth/invalid-login-credentials':
          this.error = 'Credenciales incorrectas';
          break;
        default:
          this.error = err?.message || 'Error al iniciar sesión';
      }
    }
  }

  private validarEmail(email: string): boolean {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
}
