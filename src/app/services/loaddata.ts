import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class Loaddata {
  private base = environment.apiUrl.replace(/\/$/, '');

  async cargarDatos(path: string) {
    try {
      const url = `${this.base}/${path.replace(/^\//, '')}`;
      console.log('GET URL:', url); // Para debug

      const options: any = {
        url,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      };

      const res: HttpResponse = await CapacitorHttp.get(options);
      return res.data;
    } catch (error) {
      console.error('Error cargando datos:', error);
      throw error;
    }
  }

  async guardarDatos(path: string, data: any, token?: string) {
    try {
      const url = `${this.base}/${path.replace(/^\//, '')}`;
      console.log('POST URL:', url); // Para debug
      console.log('POST Data:', data); // Para debug

      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: any = {
        url,
        data,
        headers,
      };

      const res: HttpResponse = await CapacitorHttp.post(options);
      return res.data;
    } catch (error) {
      console.error('Error guardando datos:', error);
      throw error;
    }
  }
}
