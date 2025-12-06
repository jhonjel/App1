// Archivo: src/app/models/vehiculo.ts

export interface Vehiculo {
  id: string; // ✅ UUID como string
  perfil_id?: string;
  placa: string;
  marca: string;
  modelo: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}
