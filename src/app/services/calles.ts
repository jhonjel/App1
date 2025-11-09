// ==================== SERVICIO DE CALLES ====================
// Archivo: src/app/services/calles.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Calle {
  id: string;
  nombre: string;
  codigo?: string;
  shape?: any;
  created_at?: string;
  updated_at?: string;
}

export interface CallesResponse {
  message: string;
  data: Calle[];
}

@Injectable({
  providedIn: 'root'
})
export class CallesService {
  private apiUrl = `${environment.apiUrl}/calles`;

  constructor(private http: HttpClient) {}

  // 🔹 Obtener TODAS las calles
  obtenerTodasCalles(): Observable<CallesResponse> {
    console.log('📡 Obteniendo todas las calles...');
    return this.http.get<CallesResponse>(this.apiUrl);
  }

  // 🔹 Buscar calles por nombre
  buscarCallesPorNombre(nombre: string): Observable<CallesResponse> {
    console.log(`📡 Buscando calles con nombre: "${nombre}"`);
    return this.http.get<CallesResponse>(`${this.apiUrl}?nombre=${nombre}`);
  }

  // 🔹 Obtener una calle específica por ID
  obtenerCalle(calleId: string): Observable<any> {
    console.log(`📡 Obteniendo calle: ${calleId}`);
    return this.http.get(`${this.apiUrl}/${calleId}`);
  }

  // 🔹 Obtener calles por rango de coordenadas (nearby)
  obtenerCallesCercanas(lat: number, lng: number, radio: number = 1000): Observable<CallesResponse> {
    console.log(`📡 Obteniendo calles cercanas a ${lat}, ${lng} (radio: ${radio}m)`);
    return this.http.get<CallesResponse>(
      `${this.apiUrl}/nearby?lat=${lat}&lng=${lng}&radius=${radio}`
    );
  }

  // 🔹 Obtener calles por perfil
  obtenerCallesPorPerfil(perfilId: string): Observable<CallesResponse> {
    console.log(`📡 Obteniendo calles del perfil: ${perfilId}`);
    return this.http.get<CallesResponse>(`${this.apiUrl}?perfil_id=${perfilId}`);
  }
}
