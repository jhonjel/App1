import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent, IonItem,
  IonLabel, IonInput, IonButton, IonText, IonSpinner,
  IonIcon, IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonCard,
    IonCardHeader, IonCardTitle, IonCardContent, IonItem,
    IonLabel, IonInput, IonButton, IonText, IonSpinner, IonIcon,
    IonButtons, IonBackButton
  ]
})
export class RegistroPage {
  nombre = '';
  email = '';
  password = '';
  confirmarPassword = '';
  cargando = false;
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({ personOutline, mailOutline, lockClosedOutline });
  }

  async registro() {
    this.error = '';

    // Validaciones
    if (!this.nombre || !this.email || !this.password || !this.confirmarPassword) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (!this.validarEmail(this.email)) {
      this.error = 'Email inválido';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.cargando = true;

    this.authService.registro(this.nombre, this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);
        this.cargando = false;
        alert('Cuenta creada exitosamente');
        this.router.navigate(['/tabs/tab1']);
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        this.error = err.error?.message || 'Error al crear la cuenta. Intenta nuevamente.';
        this.cargando = false;
      }
    });
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
