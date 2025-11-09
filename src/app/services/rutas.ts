// Archivo: src/app/services/rutas.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CrearRutaRequest {
  nombre_ruta: string;
  perfil_id: string;
  calles_ids?: string[];
  shape?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
}

export interface RutaResponse {
  message: string;
  data: {
    id: string;
    nombre_ruta: string;
    perfil_id: string;
    shape?: any;
    created_at: string;
    updated_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RutasService {
  private apiUrl = `${environment.apiUrl}/rutas`;

  constructor(private http: HttpClient) {}

  // Crear ruta por unión de calles
  crearRutaPorCalles(
    nombreRuta: string,
    callesIds: string[],
    perfilId: string
  ): Observable<RutaResponse> {
    const payload: CrearRutaRequest = {
      nombre_ruta: nombreRuta,
      perfil_id: perfilId,
      calles_ids: callesIds
    };

    console.log('📤 Creando ruta por calles:', payload);
    return this.http.post<RutaResponse>(this.apiUrl, payload);
  }

  // Crear ruta por geometría directa
  crearRutaPorGeometria(
    nombreRuta: string,
    coordenadas: [number, number][],
    perfilId: string
  ): Observable<RutaResponse> {
    const payload: CrearRutaRequest = {
      nombre_ruta: nombreRuta,
      perfil_id: perfilId,
      shape: {
        type: 'LineString',
        coordinates: coordenadas
      }
    };

    console.log('📤 Creando ruta por geometría:', payload);
    return this.http.post<RutaResponse>(this.apiUrl, payload);
  }

  // ✅ Obtener todas las rutas del usuario CON perfil_id
  obtenerRutas(perfilId: string): Observable<any> {
    console.log(`📡 Obteniendo rutas del perfil: ${perfilId}`);
    return this.http.get<any>(`${this.apiUrl}?perfil_id=${perfilId}`);
  }

  // ✅ Obtener una ruta específica CON perfil_id en query string
  obtenerRuta(rutaId: string, perfilId: string): Observable<any> {
    console.log(`📡 Obteniendo ruta: ${rutaId} del perfil: ${perfilId}`);
    return this.http.get(`${this.apiUrl}/${rutaId}?perfil_id=${perfilId}`);
  }
}
