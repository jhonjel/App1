import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecorridosService {
  private apiUrl = `${environment.apiUrl}/recorridos`;

  constructor(private http: HttpClient) {}

  iniciarRecorrido(data: {
    ruta_id: string;
    vehiculo_id: string;
    perfil_id: string;
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.tokenSecret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(this.apiUrl, data, { headers });
  }

  finalizarRecorrido(recorridoId: string, data: {
    perfil_id: string;
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.tokenSecret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.put(`${this.apiUrl}/${recorridoId}/finalizar`, data, { headers });
  }

  // Método para registrar posiciones durante el recorrido
  registrarPosicion(recorridoId: string, data: {
    latitud: number;
    longitud: number;
    precision_metros?: number;
  }): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.tokenSecret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return this.http.post(`${this.apiUrl}/${recorridoId}/posiciones`, data, { headers });
  }
}
