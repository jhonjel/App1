import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  token?: string;
}

export interface AuthResponse {
  message: string;
  data: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private usuarioActual$ = new BehaviorSubject<Usuario | null>(null);
  private readonly STORAGE_KEY = 'usuario_auth';

  constructor(private http: HttpClient) {
    this.cargarUsuarioGuardado();
  }

  // Observable para suscribirse a cambios del usuario
  getUsuarioObservable(): Observable<Usuario | null> {
    return this.usuarioActual$.asObservable();
  }

  // Obtener usuario actual
  getUsuarioActual(): Usuario | null {
    return this.usuarioActual$.value;
  }

  // Verificar si está autenticado
  estaAutenticado(): boolean {
    return this.usuarioActual$.value !== null && !!this.getToken();
  }

  // Obtener token
  getToken(): string | null {
    const usuario = this.usuarioActual$.value;
    return usuario?.token || null;
  }

  // Registro
  registro(nombre: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/registro`, {
      nombre,
      email,
      password
    }).pipe(
      tap(response => {
        if (response.data) {
          this.guardarUsuario(response.data);
        }
      })
    );
  }

  // Login
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.data) {
          this.guardarUsuario(response.data);
        }
      })
    );
  }

  // Verificar token
  verificarToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar`);
  }

  // Obtener perfil
  obtenerPerfil(): Observable<any> {
    return this.http.get(`${this.apiUrl}/perfil`);
  }

  // Cerrar sesión
  logout(): void {
    this.usuarioActual$.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Guardar usuario en localStorage y estado
  private guardarUsuario(usuario: Usuario): void {
    this.usuarioActual$.next(usuario);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
    console.log('✅ Usuario guardado:', usuario);
  }

  // Cargar usuario guardado al iniciar
  private cargarUsuarioGuardado(): void {
    try {
      const usuarioGuardado = localStorage.getItem(this.STORAGE_KEY);
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        this.usuarioActual$.next(usuario);
        console.log('✅ Usuario cargado desde localStorage');
      }
    } catch (error) {
      console.error('Error cargando usuario:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}
