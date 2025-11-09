import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonCardSubtitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonList,
  NavController, IonText, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, playOutline, stopOutline, locationOutline, location, radioButtonOn, arrowBack, arrowBackOutline, eyeOutline, closeOutline, eyeOffOutline } from 'ionicons/icons';
import { VehiculoSeleccionadoService } from '../services/vehiculo-seleccionado';
import { RecorridosService } from '../services/recorridos';
import { RutasService } from '../services/rutas';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth';

declare var L: any;

interface Posicion {
  lat: number;
  lon: number;
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
    IonCardSubtitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonList,
    IonText, IonSpinner
  ]
})
export class Tab2Page implements OnInit, OnDestroy, AfterViewInit {
  // Vehículo
  vehiculoSeleccionado: Vehiculo | null = null;

  // Recorrido
  recorridoActivo = false;
  recorridoActualId: string | null = null;
  posicionActual: Posicion | null = null;
  posicionesCount = 0;
  ultimasPosiciones: Posicion[] = [];

  // Rutas
  rutasDisponibles: any[] = [];
  rutaSeleccionadaId: string | null = null;
  cargandoRutas = false;
  capasRutas: Map<string, any> = new Map();

  // Mapa
  private map: any;
  private marker: any;
  private polyline: any;
  private watchId: any;
  private todasPosiciones: [number, number][] = [];
  private leafletLoaded = false;

  constructor(
    private vehiculoSeleccionadoService: VehiculoSeleccionadoService,
    private recorridosService: RecorridosService,
    private rutasService: RutasService,
    private navCtrl: NavController,
    private authService: AuthService
  ) {
    addIcons({
      arrowBackOutline, playOutline, stopOutline, radioButtonOn, location,
      locationOutline, arrowBack, logOutOutline, eyeOutline, closeOutline, eyeOffOutline
    });

    this.vehiculoSeleccionadoService.getVehiculoObservable().subscribe(vehiculo => {
      console.log('🔔 Vehículo actualizado:', vehiculo);
      this.vehiculoSeleccionado = vehiculo;
    });
  }

  ngOnInit() {
    this.vehiculoSeleccionado = this.vehiculoSeleccionadoService.getVehiculo();
    console.log('🚗 Vehículo en ngOnInit:', this.vehiculoSeleccionado);
    this.cargarRutasDisponibles();
  }

  ionViewWillEnter() {
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

  // ==================== MAPA ====================

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
        const lon = position.coords.longitude;

        this.posicionActual = {
          lat: lat,
          lon: lon,
          fecha_registro: new Date()
        };

        if (this.map) {
          this.map.setView([lat, lon], 15);

          if (this.marker) {
            this.marker.setLatLng([lat, lon]);
          } else {
            this.marker = L.marker([lat, lon]).addTo(this.map)
              .bindPopup('Tu ubicación actual')
              .openPopup();
          }
        }

        console.log('✅ Ubicación obtenida:', lat, lon);
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

  // ==================== RECORRIDO ====================

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
    // ✅ Si hay una ruta seleccionada, usarla. Si no, generar UUID
    const rutaId = this.rutaSeleccionadaId || this.generarUUID();

    // ✅ Convertir vehiculoId a string si es número
    const vehiculoId = String(this.vehiculoSeleccionado.id);

    // ✅ Usar el perfil_id correcto
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

        // El servidor retorna el ID del recorrido
        this.recorridoActualId = response.data?.id || rutaId;
        this.recorridoActivo = true;
        this.posicionesCount = 0;
        this.todasPosiciones = [];
        this.ultimasPosiciones = [];

        this.iniciarSeguimiento();
        alert('Recorrido iniciado correctamente');
      },
      error: (error) => {
        console.error('❌ Error iniciando recorrido:', error);
        console.error('❌ Response:', error.error);

        const mensaje = error?.error?.message ||
                       error?.error?.errors?.ruta_id?.[0] ||
                       'Error al iniciar recorrido. Verifica tu conexión.';

        alert(mensaje);
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
    const lon = position.coords.longitude;

    const nuevaPosicion: Posicion = {
      lat: lat,
      lon: lon,
      fecha_registro: new Date()
    };

    this.posicionActual = nuevaPosicion;

    try {
      // ✅ Nombres correctos según la API
      const dataPosicion = {
        lat: lat,
        lon: lon,
        perfil_id: environment.tokenSecret
      };

      console.log(`📍 Enviando posición ${this.posicionesCount + 1}:`, dataPosicion);

      this.recorridosService.registrarPosicion(this.recorridoActualId, dataPosicion).subscribe({
        next: (response) => {
          console.log(`📍 Posición ${this.posicionesCount + 1} guardada en API:`, response);
        },
        error: (error) => {
          console.error('❌ Error guardando posición en API:', error);
        }
      });

      this.posicionesCount++;
      this.ultimasPosiciones.unshift(nuevaPosicion);
      if (this.ultimasPosiciones.length > 5) {
        this.ultimasPosiciones.pop();
      }

      if (this.map) {
        if (this.marker) {
          this.marker.setLatLng([lat, lon]);
        }

        this.todasPosiciones.push([lat, lon]);

        if (this.polyline) {
          this.polyline.setLatLngs(this.todasPosiciones);
        } else {
          this.polyline = L.polyline(this.todasPosiciones, {
            color: 'blue',
            weight: 3
          }).addTo(this.map);
        }

        this.map.setView([lat, lon]);
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

  // ==================== RUTAS ====================

  cargarRutasDisponibles() {
    this.cargandoRutas = true;
    const perfilId = environment.tokenSecret;

    this.rutasService.obtenerRutas(perfilId).subscribe({
      next: (response) => {
        this.rutasDisponibles = response.data || [];
        this.cargandoRutas = false;
        console.log(`✅ ${this.rutasDisponibles.length} rutas cargadas`);
      },
      error: (error) => {
        console.error('❌ Error cargando rutas:', error);
        this.cargandoRutas = false;
      }
    });
  }

  mostrarRutaEnMapa(rutaId: string) {
    if (!this.map) {
      console.warn('⚠️ El mapa no está inicializado');
      return;
    }

    if (this.rutaSeleccionadaId && this.capasRutas.has(this.rutaSeleccionadaId)) {
      const capaAnterior = this.capasRutas.get(this.rutaSeleccionadaId);
      this.map.removeLayer(capaAnterior);
    }

    // ✅ Pasar perfil_id al obtener ruta
    const perfilId = environment.tokenSecret;

    this.rutasService.obtenerRuta(rutaId, perfilId).subscribe({
      next: (response) => {
        const ruta = response.data || response;
        console.log('📍 Ruta obtenida:', ruta);

        if (ruta.shape && ruta.shape.coordinates) {
          this.dibujarRutaEnMapa(ruta);
        } else {
          console.warn('⚠️ La ruta no tiene geometría');
        }

        this.rutaSeleccionadaId = rutaId;
      },
      error: (error) => {
        console.error('❌ Error obteniendo ruta:', error);
        alert('Error al obtener la ruta. Verifica tu conexión.');
      }
    });
  }

  private dibujarRutaEnMapa(ruta: any) {
    if (!this.map || !ruta.shape || !ruta.shape.coordinates) {
      return;
    }

    try {
      const coordenadas = ruta.shape.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);

      const polyline = L.polyline(coordenadas, {
        color: '#667eea',
        weight: 4,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '5, 5'
      });

      polyline.bindPopup(`
        <div class="ruta-popup">
          <strong>${ruta.nombre_ruta}</strong>
          <br>
          <small>Puntos: ${coordenadas.length}</small>
        </div>
      `);

      polyline.addTo(this.map);
      this.capasRutas.set(ruta.id, polyline);

      const bounds = polyline.getBounds();
      this.map.fitBounds(bounds, { padding: [50, 50] });

      console.log(`✅ Ruta "${ruta.nombre_ruta}" dibujada en el mapa`);
    } catch (error) {
      console.error('❌ Error dibujando ruta:', error);
    }
  }

  ocultarRutaDelMapa(rutaId: string) {
    if (this.capasRutas.has(rutaId)) {
      const capa = this.capasRutas.get(rutaId);
      this.map.removeLayer(capa);
      this.capasRutas.delete(rutaId);
      this.rutaSeleccionadaId = null;
      console.log(`✅ Ruta ocultada del mapa`);
    }
  }

  mostrarTodasRutasEnMapa() {
    if (!this.map) {
      console.warn('⚠️ El mapa no está inicializado');
      return;
    }

    const colores = ['#667eea', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    let colorIndex = 0;

    this.rutasDisponibles.forEach((ruta) => {
      if (ruta.shape && ruta.shape.coordinates && ruta.shape.coordinates.length > 0) {
        try {
          const coordenadas = ruta.shape.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          const color = colores[colorIndex % colores.length];

          const polyline = L.polyline(coordenadas, {
            color: color,
            weight: 3,
            opacity: 0.6,
            lineCap: 'round',
            lineJoin: 'round'
          });

          polyline.bindPopup(`
            <div class="ruta-popup">
              <strong>${ruta.nombre_ruta}</strong>
              <br>
              <small>Puntos: ${coordenadas.length}</small>
            </div>
          `);

          polyline.addTo(this.map);
          this.capasRutas.set(ruta.id, polyline);

          colorIndex++;
          console.log(`✅ Ruta "${ruta.nombre_ruta}" agregada al mapa`);
        } catch (error) {
          console.error(`❌ Error dibujando ruta ${ruta.nombre_ruta}:`, error);
        }
      }
    });

    if (this.capasRutas.size > 0) {
      const grupo = L.featureGroup(Array.from(this.capasRutas.values()));
      this.map.fitBounds(grupo.getBounds(), { padding: [50, 50] });
    }
  }

  limpiarRutasDelMapa() {
    this.capasRutas.forEach(capa => {
      this.map.removeLayer(capa);
    });
    this.capasRutas.clear();
    this.rutaSeleccionadaId = null;
    console.log('✅ Todas las rutas eliminadas del mapa');
  }

  // ==================== UTILIDADES ====================

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
