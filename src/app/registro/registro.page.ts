import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class RegistroPage {

  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmarPassword: string = '';
  error: string = '';
  cargando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async registro() {
    this.error = '';

    if (!this.nombre || !this.email || !this.password || !this.confirmarPassword) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (this.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.cargando = true;

    try {
      await this.authService.registro(this.email, this.password, this.nombre);
      this.cargando = false;
      this.router.navigate(['/tabs/tab1']);
    } catch (err: any) {
      this.cargando = false;
      this.error = err?.message || 'Error al crear la cuenta';
    }
  }
}




