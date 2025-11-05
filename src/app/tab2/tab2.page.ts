import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonCardSubtitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonList,
  NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, playOutline, stopOutline, locationOutline, location, radioButtonOn, arrowBack, arrowBackOutline } from 'ionicons/icons';
import { VehiculoSeleccionadoService } from '../services/vehiculo-seleccionado';
import { RecorridosService } from '../services/recorridos';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth';


declare var L: any;

interface Posicion {
  latitud: number;
  longitud: number;
  precision_metros?: number;
  fecha_registro?: Date;
}

interface Vehiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButtons, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonCardSubtitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonList
]
})
export class Tab2Page implements OnInit, OnDestroy, AfterViewInit {
  vehiculoSeleccionado: Vehiculo | null = null;
  recorridoActivo = false;
  recorridoActualId: string | null = null;
  posicionActual: Posicion | null = null;
  posicionesCount = 0;
  ultimasPosiciones: Posicion[] = [];

  private map: any;
  private marker: any;
  private polyline: any;
  private watchId: any;
  private todasPosiciones: [number, number][] = [];
  private leafletLoaded = false;

  constructor(
    private vehiculoSeleccionadoService: VehiculoSeleccionadoService,
    private recorridosService: RecorridosService,
    private navCtrl: NavController,
    private authService: AuthService // <-- Agregar esto
  ) {
    addIcons({arrowBackOutline,playOutline,stopOutline,radioButtonOn,location,locationOutline,arrowBack,logOutOutline});

    // Suscribirse a cambios del vehículo
    this.vehiculoSeleccionadoService.getVehiculoObservable().subscribe(vehiculo => {
      console.log('🔔 Vehículo actualizado:', vehiculo);
      this.vehiculoSeleccionado = vehiculo;
    });
  }

  ngOnInit() {
    // Obtener el vehículo seleccionado
    this.vehiculoSeleccionado = this.vehiculoSeleccionadoService.getVehiculo();
    console.log('🚗 Vehículo en ngOnInit:', this.vehiculoSeleccionado);
  }

  ionViewWillEnter() {
    // Este método se ejecuta cada vez que se entra a la página
    this.vehiculoSeleccionado = this.vehiculoSeleccionadoService.getVehiculo();
    console.log('🚗 Vehículo en ionViewWillEnter:', this.vehiculoSeleccionado);

    if (!this.vehiculoSeleccionado) {
      console.warn('⚠️ No hay vehículo seleccionado, redirigiendo...');
      alert('Por favor selecciona un vehículo primero');
      setTimeout(() => {
        this.navCtrl.navigateBack('/tabs/tab1');
      }, 100);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.cargarLeaflet();
    }, 300);
  }

  ngOnDestroy() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  cargarLeaflet() {
    if (this.leafletLoaded) {
      this.inicializarMapa();
      return;
    }

    if (typeof L !== 'undefined') {
      this.leafletLoaded = true;
      this.inicializarMapa();
      return;
    }

    const linkCss = document.createElement('link');
    linkCss.rel = 'stylesheet';
    linkCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    linkCss.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    linkCss.crossOrigin = '';
    document.head.appendChild(linkCss);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      this.leafletLoaded = true;
      setTimeout(() => this.inicializarMapa(), 300);
    };
    script.onerror = () => {
      console.error('❌ Error cargando Leaflet');
      alert('Error al cargar el mapa. Por favor recarga la página.');
    };
    document.head.appendChild(script);
  }

  inicializarMapa() {
    const mapElement = document.getElementById('map');

    if (!mapElement) {
      console.error('❌ Elemento del mapa no encontrado');
      setTimeout(() => this.inicializarMapa(), 500);
      return;
    }

    if (typeof L === 'undefined') {
      console.error('❌ Leaflet no está cargado');
      return;
    }

    try {
      const lat = 4.7110;
      const lng = -74.0721;

      this.map = L.map('map').setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      setTimeout(() => {
        this.map.invalidateSize();
        this.obtenerUbicacionActual();
      }, 200);

      console.log('✅ Mapa inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
    }
  }

  obtenerUbicacionActual() {
    if (!('geolocation' in navigator)) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.posicionActual = {
          latitud: lat,
          longitud: lng,
          precision_metros: position.coords.accuracy
        };

        if (this.map) {
          this.map.setView([lat, lng], 15);

          if (this.marker) {
            this.marker.setLatLng([lat, lng]);
          } else {
            this.marker = L.marker([lat, lng]).addTo(this.map)
              .bindPopup('Tu ubicación actual')
              .openPopup();
          }
        }

        console.log('✅ Ubicación obtenida:', lat, lng);
      },
      (error) => {
        console.error('❌ Error obteniendo ubicación:', error);
        let mensaje = 'No se pudo obtener tu ubicación.';

        switch(error.code) {
          case error.PERMISSION_DENIED:
            mensaje = 'Permiso de ubicación denegado. Actívalo en la configuración.';
            break;
          case error.POSITION_UNAVAILABLE:
            mensaje = 'Ubicación no disponible.';
            break;
          case error.TIMEOUT:
            mensaje = 'Tiempo de espera agotado.';
            break;
        }

        alert(mensaje);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  async iniciarRecorrido() {
    console.log('🎬 Iniciando recorrido...');

    if (!this.vehiculoSeleccionado) {
      alert('No hay vehículo seleccionado');
      return;
    }

    if (!this.posicionActual) {
      alert('Esperando ubicación GPS...');
      this.obtenerUbicacionActual();
      return;
    }

    if (this.recorridoActivo) {
      alert('Ya hay un recorrido en curso');
      return;
    }

    try {
      // Generar IDs únicos
      const rutaId = this.generarUUID();
      const vehiculoId = this.vehiculoSeleccionado.id.toString();
      const perfilId = environment.tokenSecret;

      const nuevoRecorrido = {
        ruta_id: rutaId,
        vehiculo_id: vehiculoId,
        perfil_id: perfilId
      };

      console.log('📤 Enviando recorrido:', nuevoRecorrido);

      this.recorridosService.iniciarRecorrido(nuevoRecorrido).subscribe({
        next: (response) => {
          console.log('✅ Recorrido iniciado:', response);

          // Guardar el ID del recorrido que devuelve la API
          this.recorridoActualId = response.data?.id || response.id || rutaId;
          this.recorridoActivo = true;
          this.posicionesCount = 0;
          this.todasPosiciones = [];
          this.ultimasPosiciones = [];

          // Iniciar seguimiento GPS
          this.iniciarSeguimiento();

          alert('Recorrido iniciado correctamente');
        },
        error: (error) => {
          console.error('❌ Error iniciando recorrido:', error);
          alert(error?.error?.message || 'Error al iniciar recorrido. Verifica tu conexión.');
        }
      });

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Error inesperado al iniciar recorrido');
    }
  }

  iniciarSeguimiento() {
    if (!('geolocation' in navigator)) {
      alert('Geolocalización no disponible');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.guardarPosicion(position);
      },
      (error) => {
        console.error('❌ Error en seguimiento:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    console.log('✅ Seguimiento GPS iniciado');
  }

  async guardarPosicion(position: GeolocationPosition) {
    if (!this.recorridoActivo || !this.recorridoActualId) {
      return;
    }

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const nuevaPosicion: Posicion = {
      latitud: lat,
      longitud: lng,
      precision_metros: position.coords.accuracy,
      fecha_registro: new Date()
    };

    this.posicionActual = nuevaPosicion;

    try {
      // Enviar posición a la API
      const dataPosicion = {
        latitud: lat,
        longitud: lng,
        precision_metros: position.coords.accuracy
      };

      this.recorridosService.registrarPosicion(this.recorridoActualId, dataPosicion).subscribe({
        next: (response) => {
          console.log(`📍 Posición ${this.posicionesCount + 1} guardada en API`);
        },
        error: (error) => {
          console.error('❌ Error guardando posición en API:', error);
        }
      });

      // Actualizar interfaz
      this.posicionesCount++;
      this.ultimasPosiciones.unshift(nuevaPosicion);
      if (this.ultimasPosiciones.length > 5) {
        this.ultimasPosiciones.pop();
      }

      // Actualizar mapa
      if (this.map) {
        if (this.marker) {
          this.marker.setLatLng([lat, lng]);
        }

        this.todasPosiciones.push([lat, lng]);

        if (this.polyline) {
          this.polyline.setLatLngs(this.todasPosiciones);
        } else {
          this.polyline = L.polyline(this.todasPosiciones, {
            color: 'blue',
            weight: 3
          }).addTo(this.map);
        }

        this.map.setView([lat, lng]);
      }

    } catch (error) {
      console.error('❌ Error guardando posición:', error);
    }
  }

  async finalizarRecorrido() {
    console.log('🛑 Finalizando recorrido...');

    if (!this.recorridoActivo || !this.recorridoActualId) {
      alert('No hay recorrido activo');
      return;
    }

    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    try {
      const dataFinalizar = {
        perfil_id: environment.tokenSecret
      };

      this.recorridosService.finalizarRecorrido(this.recorridoActualId, dataFinalizar).subscribe({
        next: (response) => {
          console.log('✅ Recorrido finalizado:', response);

          this.recorridoActivo = false;
          this.recorridoActualId = null;

          alert(`Recorrido finalizado. Total de posiciones: ${this.posicionesCount}`);
        },
        error: (error) => {
          console.error('❌ Error finalizando recorrido:', error);
          alert(error?.error?.message || 'Error al finalizar recorrido');
        }
      });

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Error inesperado al finalizar recorrido');
    }
  }

  private generarUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  volverAVehiculos() {
    if (this.recorridoActivo) {
      if (confirm('Hay un recorrido activo. ¿Deseas finalizarlo?')) {
        this.finalizarRecorrido();
      }
    }
    this.navCtrl.navigateBack('/tabs/tab1');
  }


  cerrarSesion() {
  if (this.recorridoActivo) {
    if (confirm('Hay un recorrido activo. ¿Deseas finalizarlo antes de cerrar sesión?')) {
      this.finalizarRecorrido();
    }
  }

  if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
    this.authService.logout();
    this.navCtrl.navigateRoot('/login');
  }
}
}
