import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Vehiculo {
  id: number;
  perfil_id?: string;
  placa: string;
  marca: string;
  modelo: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehiculoSeleccionadoService {
  private vehiculoSubject = new BehaviorSubject<Vehiculo | null>(null);
  public vehiculo$ = this.vehiculoSubject.asObservable();

  constructor() {
    console.log('🔧 VehiculoSeleccionadoService inicializado');
  }

  setVehiculo(vehiculo: Vehiculo | null) {
    console.log('💾 Guardando vehículo:', vehiculo);
    this.vehiculoSubject.next(vehiculo);
  }

  getVehiculo(): Vehiculo | null {
    const vehiculo = this.vehiculoSubject.value;
    console.log('📖 Obteniendo vehículo:', vehiculo);
    return vehiculo;
  }

  clearVehiculo() {
    console.log('🗑️ Limpiando vehículo');
    this.vehiculoSubject.next(null);
  }

  // Observable para suscribirse a cambios
  getVehiculoObservable(): Observable<Vehiculo | null> {
    return this.vehiculo$;
  }
}
