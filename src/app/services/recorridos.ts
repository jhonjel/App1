// Archivo: src/app/services/recorridos.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IniciarRecorridoRequest {
  ruta_id: string;
  vehiculo_id: string;
  perfil_id: string;
}

export interface RegistrarPosicionRequest {
  lat: number;
  lon: number;
  perfil_id: string;
}

export interface RecorridoResponse {
  message: string;
  data: {
    id: string;
    ruta_id: string;
    vehiculo_id: string;
    perfil_id: string;
    estado: string;
    fecha_inicio: string;
    fecha_fin?: string;
    total_posiciones?: number;
  };
}

export interface PosicionResponse {
  message: string;
  data: {
    id: string;
    recorrido_id: string;
    lat: number;
    lon: number;
    perfil_id: string;
    fecha_registro: string;
  };
}

export interface FinalizarRecorridoRequest {
  perfil_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecorridosService {
  private apiUrl = `${environment.apiUrl}/recorridos`;

  constructor(private http: HttpClient) {}

  // ✅ Iniciar Recorrido
  iniciarRecorrido(data: IniciarRecorridoRequest): Observable<RecorridoResponse> {
    console.log('📤 Iniciando recorrido:', data);
    return this.http.post<RecorridoResponse>(
      `${this.apiUrl}/iniciar`,
      data
    );
  }

  // ✅ Registrar Posición
  registrarPosicion(
    recorridoId: string,
    data: RegistrarPosicionRequest
  ): Observable<PosicionResponse> {
    console.log(`📍 Registrando posición para recorrido ${recorridoId}:`, data);
    return this.http.post<PosicionResponse>(
      `${this.apiUrl}/${recorridoId}/posiciones`,
      data
    );
  }

  // ✅ Finalizar Recorrido
  finalizarRecorrido(
    recorridoId: string,
    data: FinalizarRecorridoRequest
  ): Observable<RecorridoResponse> {
    console.log(`📤 Finalizando recorrido ${recorridoId}:`, data);
    return this.http.put<RecorridoResponse>(
      `${this.apiUrl}/${recorridoId}/finalizar`,
      data
    );
  }

  // 🆕 Obtener Recorrido por ID
  obtenerRecorrido(recorridoId: string): Observable<RecorridoResponse> {
    console.log(`📡 Obteniendo recorrido: ${recorridoId}`);
    return this.http.get<RecorridoResponse>(`${this.apiUrl}/${recorridoId}`);
  }

  // 🆕 Obtener Recorridos del Perfil
  obtenerRecorridosPorPerfil(perfilId: string): Observable<any> {
    console.log(`📡 Obteniendo recorridos del perfil: ${perfilId}`);
    return this.http.get<any>(`${this.apiUrl}?perfil_id=${perfilId}`);
  }

  // 🆕 Obtener Posiciones del Recorrido
  obtenerPosiciones(recorridoId: string): Observable<any> {
    console.log(`📡 Obteniendo posiciones del recorrido: ${recorridoId}`);
    return this.http.get<any>(`${this.apiUrl}/${recorridoId}/posiciones`);
  }
}
