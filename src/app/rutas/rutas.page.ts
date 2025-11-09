import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonInput, IonLabel, IonItem, IonList, IonText, IonSpinner,
  IonCheckbox, IonSearchbar, IonBadge, IonNote, IonCardSubtitle, IonItemGroup, IonItemDivider } from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowBackOutline, checkmarkOutline, closeOutline, trashOutline, searchOutline, checkmarkCircle } from 'ionicons/icons';
import { RutasService } from '../services/rutas';
import { CallesService, Calle } from '../services/calles';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-crear-ruta',
  templateUrl: './rutas.page.html',
  styleUrls: ['./rutas.page.scss'],
  standalone: true,
  imports: [IonItemDivider, IonItemGroup, IonCardSubtitle,
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonInput, IonLabel, IonItem, IonList, IonText, IonSpinner, IonCheckbox,
    IonSearchbar, IonBadge, IonNote
  ]
})
export class CrearRutaComponent implements OnInit {
  // Formulario
  nombreRuta = '';
  tipoRuta: 'calles' | 'geometria' = 'calles';

  // Calles
  todasCalles: Calle[] = [];
  callesSeleccionadas: Calle[] = [];
  busquedaCalles = '';
  cargandoCalles = false;

  // Coordenadas
  coordenadas: { lat: number; lng: number }[] = [{ lat: 0, lng: 0 }];

  // Estados
  cargando = false;
  rutaCreada = false;
  rutaCreadadData: any = null;

  constructor(
    private rutasService: RutasService,
    private callesService: CallesService,
    private navCtrl: NavController,
    private toastController: ToastController
  ) {
    addIcons({arrowBackOutline,checkmarkOutline,closeOutline,trashOutline,checkmarkCircle,searchOutline});
  }

  ngOnInit() {
    console.log('✅ Componente de crear ruta cargado');
    this.cargarCalles();
  }

  // ==================== CALLES ====================

  cargarCalles() {
    this.cargandoCalles = true;
    this.callesService.obtenerTodasCalles().subscribe({
      next: (response) => {
        this.todasCalles = response.data || [];
        this.cargandoCalles = false;
        console.log(`✅ ${this.todasCalles.length} calles cargadas`);
      },
      error: (error) => {
        console.error('❌ Error cargando calles:', error);
        this.cargandoCalles = false;
        this.mostrarToast('Error al cargar las calles', 'danger');
      }
    });
  }

  get callesFiltradas(): Calle[] {
    if (!this.busquedaCalles.trim()) {
      return this.todasCalles;
    }

    const busqueda = this.busquedaCalles.toLowerCase();
    return this.todasCalles.filter(calle =>
      (calle.nombre && calle.nombre.toLowerCase().includes(busqueda)) ||
      (calle.codigo && calle.codigo.toLowerCase().includes(busqueda)) ||
      (calle.id && calle.id.toLowerCase().includes(busqueda))
    );
  }

  seleccionarCalle(calle: Calle) {
    const yaExiste = this.callesSeleccionadas.some(c => c.id === calle.id);

    if (yaExiste) {
      this.callesSeleccionadas = this.callesSeleccionadas.filter(c => c.id !== calle.id);
      console.log(`❌ Calle removida: ${calle.nombre}`);
    } else {
      this.callesSeleccionadas.push(calle);
      console.log(`✅ Calle seleccionada: ${calle.nombre}`);
    }
  }

  estaSeleccionada(calle: Calle): boolean {
    return this.callesSeleccionadas.some(c => c.id === calle.id);
  }

  removerCalle(calleId: string) {
    this.callesSeleccionadas = this.callesSeleccionadas.filter(c => c.id !== calleId);
  }

  limpiarSeleccion() {
    this.callesSeleccionadas = [];
  }

  // ==================== COORDENADAS ====================

  agregarCoordenada() {
    this.coordenadas.push({ lat: 0, lng: 0 });
  }

  eliminarCoordenada(index: number) {
    this.coordenadas.splice(index, 1);
  }

  // ==================== VALIDACIÓN ====================

  esValido(): boolean {
    if (!this.nombreRuta.trim()) {
      return false;
    }

    if (this.tipoRuta === 'calles') {
      return this.callesSeleccionadas.length > 0;
    } else {
      return this.coordenadas.length >= 2 &&
             this.coordenadas.every(c => c.lat !== 0 || c.lng !== 0);
    }
  }

  // ==================== CREAR RUTA ====================

  async crearRuta() {
    if (!this.esValido()) {
      await this.mostrarToast('Por favor completa los campos requeridos', 'warning');
      return;
    }

    this.cargando = true;

    try {
      const perfilId = environment.tokenSecret;

      if (this.tipoRuta === 'calles') {
        const callesIds = this.callesSeleccionadas.map(c => c.id);

        console.log('📤 Creando ruta con calles:', callesIds);

        this.rutasService.crearRutaPorCalles(
          this.nombreRuta,
          callesIds,
          perfilId
        ).subscribe({
          next: (response) => {
            console.log('✅ Ruta creada:', response);
            this.rutaCreadadData = response.data;
            this.rutaCreada = true;
            this.cargando = false;
            this.mostrarToast('✅ Ruta creada correctamente', 'success');
          },
          error: (error) => {
            console.error('❌ Error:', error);
            this.cargando = false;
            this.mostrarToast(
              error?.error?.message || 'Error al crear la ruta',
              'danger'
            );
          }
        });
      } else {
        const coordenadasValidas = this.coordenadas.map(c => [c.lng, c.lat] as [number, number]);

        console.log('📤 Creando ruta con geometría:', coordenadasValidas);

        this.rutasService.crearRutaPorGeometria(
          this.nombreRuta,
          coordenadasValidas,
          perfilId
        ).subscribe({
          next: (response) => {
            console.log('✅ Ruta creada:', response);
            this.rutaCreadadData = response.data;
            this.rutaCreada = true;
            this.cargando = false;
            this.mostrarToast('✅ Ruta creada correctamente', 'success');
          },
          error: (error) => {
            console.error('❌ Error:', error);
            this.cargando = false;
            this.mostrarToast(
              error?.error?.message || 'Error al crear la ruta',
              'danger'
            );
          }
        });
      }
    } catch (error: any) {
      console.error('❌ Error inesperado:', error);
      this.cargando = false;
      await this.mostrarToast('Error inesperado', 'danger');
    }
  }

  reiniciarFormulario() {
    this.nombreRuta = '';
    this.tipoRuta = 'calles';
    this.callesSeleccionadas = [];
    this.busquedaCalles = '';
    this.coordenadas = [{ lat: 0, lng: 0 }];
    this.rutaCreada = false;
    this.rutaCreadadData = null;
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    await toast.present();
  }

  volver() {
    this.navCtrl.navigateBack('/tabs/tab1');
  }
}
