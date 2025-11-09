import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router'; // 🆕 IMPORTAR
import { VehiculosService } from '../services/vehiculos';
import { VehiculoSeleccionadoService } from '../services/vehiculo-seleccionado';
import { addIcons } from 'ionicons';
import { addOutline, addCircleOutline, carOutline } from 'ionicons/icons'; // 🆕 IMPORTAR ICONOS

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule], // 🆕 AGREGAR RouterModule
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss']
})
export class Tab1Page implements OnInit {
  vehiculos: any[] = [];
  cargando = false;
  error = '';

  constructor(
    private vehiculosService: VehiculosService,
    private vehiculoSeleccionadoService: VehiculoSeleccionadoService,
    private navCtrl: NavController
  ) {
    // 🆕 Agregar iconos
    addIcons({ addOutline, addCircleOutline, carOutline });
  }

  ngOnInit() {
    this.cargarVehiculos();
  }

  ionViewWillEnter() {
    // Limpiar el vehículo seleccionado al entrar a la página
    this.vehiculoSeleccionadoService.clearVehiculo();
    // Recargar vehículos por si hay cambios
    this.cargarVehiculos();
  }

  cargarVehiculos() {
    this.cargando = true;
    this.vehiculosService.obtenerVehiculos().subscribe({
      next: (data) => {
        this.vehiculos = data.data || [];
        this.cargando = false;
        console.log('✅ Vehículos cargados:', this.vehiculos.length);
      },
      error: (err) => {
        this.error = 'Error al obtener vehículos';
        console.error('❌ Error al obtener vehículos:', err);
        this.cargando = false;
      }
    });
  }

  seleccionarVehiculo(vehiculo: any) {
    console.log('🚗 Vehículo seleccionado:', vehiculo);

    // Guardar el vehículo en el servicio
    this.vehiculoSeleccionadoService.setVehiculo(vehiculo);

    // Verificar que se guardó correctamente
    const vehiculoGuardado = this.vehiculoSeleccionadoService.getVehiculo();
    console.log('✅ Vehículo guardado en servicio:', vehiculoGuardado);

    // Navegar al tab2
    this.navCtrl.navigateForward('/tabs/tab2');
  }
}
