import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonItem,
  IonLabel, IonInput, IonButton, IonText, IonSpinner,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, personAddOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonItem,
    IonLabel, IonInput, IonButton, IonText, IonSpinner, IonIcon
  ]
})
export class LoginPage {
  email = '';
  password = '';
  cargando = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ mailOutline, lockClosedOutline, personAddOutline });
  }

  ionViewWillEnter() {
    // Si ya está autenticado, redirigir a tabs
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/tabs/tab1']);
    }
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

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        this.cargando = false;
        this.router.navigate(['/tabs/tab1']);
      },
      error: (err) => {
        console.error('❌ Error en login:', err);
        this.error = err.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        this.cargando = false;
      }
    });
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
