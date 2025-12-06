// Archivo: src/app/services/vehiculos.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// ✅ CORREGIR: Vehiculo debe tener id como string (UUID)
export interface Vehiculo {
  id: string; // ✅ CAMBIAR de number a string
  perfil_id?: string;
  placa: string;
  marca: string;
  modelo: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) {}

  // Obtener vehículos filtrados por perfil_id
  obtenerVehiculos(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.tokenSecret}`,
      'Accept': 'application/json'
    });

    const perfilId = environment.tokenSecret;
    const url = `${this.apiUrl}?perfil_id=${perfilId}`;

    console.log('📡 Obteniendo vehículos desde:', url);
    return this.http.get(url, { headers });
  }

  // ✅ NUEVO: Obtener un vehículo específico
  obtenerVehiculo(vehiculoId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.tokenSecret}`,
      'Accept': 'application/json'
    });

    const perfilId = environment.tokenSecret;
    const url = `${this.apiUrl}/${vehiculoId}?perfil_id=${perfilId}`;

    console.log('📡 Obteniendo vehículo:', url);
    return this.http.get(url, { headers });
  }
}
