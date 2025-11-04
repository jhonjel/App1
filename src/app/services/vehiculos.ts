import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehiculosService {
  private apiUrl = `${environment.apiUrl}/vehiculos`;

  constructor(private http: HttpClient) {}

  // 🔹 Método para obtener los vehículos filtrados por perfil_id
  obtenerVehiculos(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.tokenSecret}`,
      'Accept': 'application/json'
    });

    // Se pasa el perfil_id como query param (así lo pide tu API)
    const perfilId = environment.tokenSecret;
    const url = `${this.apiUrl}?perfil_id=${perfilId}`;

    return this.http.get(url, { headers });
  }
}
