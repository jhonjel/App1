// Archivo: src/app/services/auth.service.ts
// ✅ Sistema de autenticación con roles usando localStorage (sin Firestore)

import { Injectable, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'visitante';
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private usuarioActual: User | null = null;
  private perfilUsuario: UserProfile | null = null;

  constructor() {
    this.cargarPerfilDesdeStorage();
  }

  usuarioObservable = new Observable<User | null>((subscriber) => {
    return this.auth.onAuthStateChanged(async (user) => {
      this.usuarioActual = user;

      if (user) {
        await this.cargarPerfilUsuario(user.uid);
      } else {
        this.perfilUsuario = null;
      }

      subscriber.next(user);
    });
  });

  // ✅ Cargar perfil desde localStorage
  private cargarPerfilDesdeStorage() {
    const perfilGuardado = localStorage.getItem('userProfile');
    if (perfilGuardado) {
      try {
        this.perfilUsuario = JSON.parse(perfilGuardado);
        console.log('✅ Perfil cargado desde localStorage:', this.perfilUsuario);
      } catch (error) {
        console.error('❌ Error parseando perfil:', error);
        this.perfilUsuario = null;
      }
    }
  }

  // ✅ Cargar perfil del usuario
  private async cargarPerfilUsuario(uid: string) {
    try {
      // Intentar cargar desde localStorage
      const perfilGuardado = localStorage.getItem(`userProfile_${uid}`);

      if (perfilGuardado) {
        this.perfilUsuario = JSON.parse(perfilGuardado);
        localStorage.setItem('userProfile', perfilGuardado);
        console.log('✅ Perfil de usuario cargado:', this.perfilUsuario);
      } else {
        console.warn('⚠️ No se encontró perfil para el usuario');
        this.perfilUsuario = null;
      }
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
      this.perfilUsuario = null;
    }
  }

  // ✅ Registro con rol
  async registro(email: string, password: string, nombre: string, rol: 'admin' | 'visitante' = 'visitante') {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(cred.user, { displayName: nombre });

      // Guardar perfil en localStorage
      const userProfile: UserProfile = {
        uid: cred.user.uid,
        email: email,
        displayName: nombre,
        role: rol,
        createdAt: new Date()
      };

      // Guardar en localStorage
      localStorage.setItem(`userProfile_${cred.user.uid}`, JSON.stringify(userProfile));
      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      this.usuarioActual = cred.user;
      this.perfilUsuario = userProfile;

      console.log(`✅ Usuario registrado como ${rol}:`, email);
      return cred;
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      this.usuarioActual = cred.user;

      // Cargar perfil del usuario
      await this.cargarPerfilUsuario(cred.user.uid);

      console.log('✅ Login exitoso:', email);
      console.log('👤 Rol del usuario:', this.perfilUsuario?.role || 'No definido');

      return cred;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  }

  getUsuario() {
    return this.usuarioActual;
  }

  // ✅ Obtener perfil completo
  getPerfil(): UserProfile | null {
    return this.perfilUsuario;
  }

  // ✅ Verificar si es admin
  isAdmin(): boolean {
    return this.perfilUsuario?.role === 'admin';
  }

  // ✅ Verificar si es visitante
  isVisitante(): boolean {
    return this.perfilUsuario?.role === 'visitante';
  }

  // ✅ Obtener rol
  getRole(): 'admin' | 'visitante' | null {
    return this.perfilUsuario?.role || null;
  }

  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    return user ? await user.getIdToken() : null;
  }

  logout() {
    this.perfilUsuario = null;
    localStorage.removeItem('userProfile');
    return this.auth.signOut();
  }
}
