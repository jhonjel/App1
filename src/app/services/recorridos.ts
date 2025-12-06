// Archivo: src/app/services/recorridos.ts
// ✅ VERSIÓN CORREGIDA - Registro de posiciones con logs detallados

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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
    ts_inicio?: string;
    ts_fin?: string;
    fecha_inicio?: string;
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

  constructor(private http: HttpClient) {
    console.log('🔧 RecorridosService - API URL:', this.apiUrl);
  }

  // ✅ Iniciar Recorrido
  iniciarRecorrido(data: IniciarRecorridoRequest): Observable<RecorridoResponse> {
    const url = `${this.apiUrl}/iniciar`;
    
    console.log('📤 ===== INICIAR RECORRIDO =====');
    console.log('📤 URL:', url);
    console.log('📦 Data:', JSON.stringify(data, null, 2));

    return this.http.post<RecorridoResponse>(url, data).pipe(
      tap(response => {
        console.log('✅ ===== RESPUESTA INICIAR RECORRIDO =====');
        console.log('📥 Response completa:', JSON.stringify(response, null, 2));
        console.log('🔑 ID del recorrido:', response.data?.id);
      }),
      catchError(error => {
        console.error('❌ ===== ERROR INICIAR RECORRIDO =====');
        console.error('Error completo:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
        throw error;
      })
    );
  }

  // ✅ Registrar Posición - CRÍTICO - CON VALIDACIONES EXHAUSTIVAS
  registrarPosicion(
    recorridoId: string,
    data: RegistrarPosicionRequest
  ): Observable<PosicionResponse> {
    const url = `${this.apiUrl}/${recorridoId}/posiciones`;

    // ✅ VALIDACIONES PREVIAS
    console.log('📍 ===== REGISTRANDO POSICIÓN =====');
    console.log('📤 URL:', url);
    console.log('🔑 Recorrido ID:', recorridoId);
    console.log('📦 Data original:', data);

    // Validar que lat y lon sean números válidos
    if (typeof data.lat !== 'number' || isNaN(data.lat)) {
      console.error('❌ ERROR: lat no es un número válido:', data.lat, typeof data.lat);
      throw new Error(`lat inválido: ${data.lat}`);
    }

    if (typeof data.lon !== 'number' || isNaN(data.lon)) {
      console.error('❌ ERROR: lon no es un número válido:', data.lon, typeof data.lon);
      throw new Error(`lon inválido: ${data.lon}`);
    }

    if (!data.perfil_id || data.perfil_id.trim() === '') {
      console.error('❌ ERROR: perfil_id vacío');
      throw new Error('perfil_id es requerido');
    }

    // Asegurar que sean números con precisión correcta
    const posicionLimpia: RegistrarPosicionRequest = {
      lat: Number(data.lat),
      lon: Number(data.lon),
      perfil_id: data.perfil_id
    };

    console.log('📦 Data limpia (después de validación):', JSON.stringify(posicionLimpia, null, 2));
    console.log('🔍 Tipos finales:', {
      lat: typeof posicionLimpia.lat,
      lon: typeof posicionLimpia.lon,
      perfil_id: typeof posicionLimpia.perfil_id
    });

    console.log('📤 Enviando a:', url);

    return this.http.post<PosicionResponse>(url, posicionLimpia).pipe(
      tap(response => {
        console.log('✅ ===== POSICIÓN REGISTRADA =====');
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        console.log('🆔 ID posición:', response.data?.id);
        console.log('📍 Coordenadas confirmadas:', {
          lat: response.data?.lat,
          lon: response.data?.lon
        });
      }),
      catchError(error => {
        console.error('❌ ===== ERROR REGISTRANDO POSICIÓN =====');
        console.error('📍 Datos enviados:', posicionLimpia);
        console.error('🔴 Error status:', error.status);
        console.error('🔴 Error message:', error.message);
        console.error('🔴 Error body:', JSON.stringify(error.error, null, 2));
        console.error('🔴 Error completo:', error);
        
        // Log adicional para debugging
        if (error.error?.errors) {
          console.error('🔴 Errores de validación:', error.error.errors);
        }
        
        throw error;
      })
    );
  }

  // ✅ Finalizar Recorrido
  finalizarRecorrido(
    recorridoId: string,
    data: FinalizarRecorridoRequest
  ): Observable<RecorridoResponse> {
    const url = `${this.apiUrl}/${recorridoId}/finalizar`;
    
    console.log('🛑 ===== FINALIZANDO RECORRIDO =====');
    console.log('📤 URL:', url);
    console.log('🔑 Recorrido ID:', recorridoId);
    console.log('📦 Data:', data);

    return this.http.post<RecorridoResponse>(url, data).pipe(
      tap(response => {
        console.log('✅ ===== RECORRIDO FINALIZADO =====');
        console.log('📥 Response:', response);
      }),
      catchError(error => {
        console.error('❌ ===== ERROR FINALIZANDO RECORRIDO =====');
        console.error('Error:', error);
        throw error;
      })
    );
  }

  // ✅ Obtener Posiciones del Recorrido
  obtenerPosiciones(recorridoId: string, perfilId?: string): Observable<any> {
    let url = `${this.apiUrl}/${recorridoId}/posiciones`;

    if (perfilId) {
      url += `?perfil_id=${perfilId}`;
    }

    console.log('📡 GET Posiciones:', url);

    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log(`📍 Posiciones obtenidas (${response.data?.length || 0}):`, response);
        if (response.data && response.data.length > 0) {
          console.log('📍 Primera posición:', response.data[0]);
          console.log('📍 Última posición:', response.data[response.data.length - 1]);
        }
      }),
      catchError(error => {
        console.error('❌ Error obteniendo posiciones:', error);
        throw error;
      })
    );
  }

  // ✅ Obtener Mis Recorridos
  obtenerRecorridosPorPerfil(perfilId: string): Observable<any> {
    const url = `${environment.apiUrl}/misrecorridos?perfil_id=${perfilId}`;
    console.log('📡 GET Mis Recorridos:', url);

    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log('📦 Mis recorridos:', response);
        console.log('📊 Total recorridos:', response.data?.length || 0);
      })
    );
  }

  // ✅ Obtener un recorrido específico
  obtenerRecorrido(recorridoId: string): Observable<RecorridoResponse> {
    const url = `${this.apiUrl}/${recorridoId}`;
    console.log('📡 GET Recorrido:', url);

    return this.http.get<RecorridoResponse>(url).pipe(
      tap(response => {
        console.log('📦 Recorrido:', response);
      })
    );
  }
}