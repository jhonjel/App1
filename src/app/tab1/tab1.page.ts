// Archivo: src/app/tab1/tab1.page.ts
// ✅ VERSIÓN CORREGIDA - Previene selección de vehículos con recorrido activo

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { VehiculosService } from '../services/vehiculos';
import { VehiculoSeleccionadoService, Vehiculo } from '../services/vehiculo-seleccionado';
import { RecorridosService } from '../services/recorridos';
import { environment } from '../../environments/environment';
import { addIcons } from 'ionicons';
import { addOutline, addCircleOutline, carOutline, mapOutline, alertCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss']
})
export class Tab1Page implements OnInit {
  vehiculos: Vehiculo[] = [];
  cargando = false;
  error = '';

  // ✅ NUEVO: Mapa de vehículos con recorridos activos
  vehiculosConRecorridoActivo: Set<string> = new Set();
  cargandoRecorridos = false;

  constructor(
    private vehiculosService: VehiculosService,
    private vehiculoSeleccionadoService: VehiculoSeleccionadoService,
    private recorridosService: RecorridosService,
    private navCtrl: NavController,
    private toastController: ToastController
  ) {
    addIcons({ addOutline, addCircleOutline, carOutline, mapOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.cargarVehiculos();
  }

  ionViewWillEnter() {
    this.vehiculoSeleccionadoService.clearVehiculo();
    this.cargarVehiculos();
  }

  async cargarVehiculos() {
    this.cargando = true;
    this.error = '';

    try {
      // Cargar vehículos
      this.vehiculosService.obtenerVehiculos().subscribe({
        next: (data) => {
          this.vehiculos = data.data || [];
          console.log('✅ Vehículos cargados:', this.vehiculos.length);

          // ✅ Cargar recorridos activos
          this.cargarRecorridosActivos();
        },
        error: (err: any) => {
          this.error = 'Error al obtener vehículos';
          console.error('❌ Error al obtener vehículos:', err);
          this.cargando = false;
        }
      });
    } catch (error) {
      console.error('❌ Error:', error);
      this.cargando = false;
    }
  }

  // ✅ NUEVA FUNCIÓN: Verificar qué vehículos tienen recorridos activos
  async cargarRecorridosActivos() {
    this.cargandoRecorridos = true;
    const perfilId = environment.tokenSecret;

    this.recorridosService.obtenerRecorridosPorPerfil(perfilId).subscribe({
      next: (response) => {
        const recorridos = response.data || [];
        console.log('📦 Recorridos obtenidos:', recorridos.length);

        // Filtrar recorridos activos (sin ts_fin)
        const recorridosActivos = recorridos.filter((r: any) => {
          const tieneInicio = !!r.ts_inicio;
          const noTieneFin = !r.ts_fin || r.ts_fin === null || r.ts_fin === '';
          return tieneInicio && noTieneFin;
        });

        console.log('✅ Recorridos activos:', recorridosActivos.length);

        // Guardar IDs de vehículos con recorrido activo
        this.vehiculosConRecorridoActivo.clear();
        recorridosActivos.forEach((r: any) => {
          if (r.vehiculo_id) {
            this.vehiculosConRecorridoActivo.add(r.vehiculo_id.toString());
            console.log(`🚗 Vehículo ${r.vehiculo_id} tiene recorrido activo`);
          }
        });

        this.cargandoRecorridos = false;
        this.cargando = false;
      },
      error: (error) => {
        console.error('❌ Error cargando recorridos activos:', error);
        this.cargandoRecorridos = false;
        this.cargando = false;
      }
    });
  }

  // ✅ FUNCIÓN MEJORADA: Verifica si el vehículo tiene recorrido activo
  async seleccionarVehiculo(vehiculo: Vehiculo) {
    console.log('🚗 Intentando seleccionar vehículo:', vehiculo);

    // ✅ Verificar si el vehículo tiene un recorrido activo
    if (this.vehiculosConRecorridoActivo.has(vehiculo.id.toString())) {
      console.warn('⚠️ Este vehículo ya tiene un recorrido activo');

      await this.mostrarToast(
        `⚠️ El vehículo ${vehiculo.placa} ya tiene un recorrido en curso. Finaliza el recorrido actual primero.`,
        'warning'
      );

      return;
    }

    // ✅ Si no tiene recorrido activo, permitir selección
    console.log('✅ Vehículo sin recorrido activo, permitiendo selección');
    this.vehiculoSeleccionadoService.setVehiculo(vehiculo);

    const vehiculoGuardado = this.vehiculoSeleccionadoService.getVehiculo();
    console.log('✅ Vehículo guardado en servicio:', vehiculoGuardado);

    await this.mostrarToast(
      `✅ Vehículo ${vehiculo.placa} seleccionado`,
      'success'
    );

    this.navCtrl.navigateForward('/tabs/tab2');
  }

  // ✅ Verificar si un vehículo tiene recorrido activo
  tieneRecorridoActivo(vehiculoId: string): boolean {
    return this.vehiculosConRecorridoActivo.has(vehiculoId.toString());
  }

  // ✅ Método para mostrar toasts
  async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger' | 'primary' = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
