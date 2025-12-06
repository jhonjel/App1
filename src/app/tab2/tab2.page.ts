// Archivo: src/app/tab2/tab2.page.ts
// ✅ VERSIÓN COMPLETA - GPS con validaciones exhaustivas y logs detallados

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonCardSubtitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonList,
  NavController, IonText, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  logOutOutline, playOutline, stopOutline, locationOutline, location,
  radioButtonOn, arrowBack, arrowBackOutline, eyeOutline, closeOutline,
  eyeOffOutline, alertCircleOutline
} from 'ionicons/icons';
import { VehiculoSeleccionadoService, Vehiculo } from '../services/vehiculo-seleccionado';
import { RecorridosService } from '../services/recorridos';
import { RutasService } from '../services/rutas';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

declare var L: any;

interface Posicion {
  lat: number;
  lon: number;
  fecha_registro?: Date;
}

interface RutaShape {
  type: 'LineString' | 'MultiLineString';
  coordinates: [number, number][] | [number, number][][];
}

interface Ruta {
  id: string;
  nombre_ruta: string;
  perfil_id: string;
  shape: RutaShape | string | null;
  color_hex?: string;
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
  vehiculoSeleccionado: Vehiculo | null = null;
  recorridoActivo = false;
  recorridoActualId: string | null = null;
  posicionActual: Posicion | null = null;
  posicionesCount = 0;
  ultimasPosiciones: Posicion[] = [];

  rutasDisponibles: Ruta[] = [];
  rutaSeleccionadaId: string | null = null;
  cargandoRutas = false;
  capasRutas: Map<string, any> = new Map();

  private map: any;
  private marker: any;
  private polyline: any;
  private watchId: any;
  private todasPosiciones: [number, number][] = [];
  private leafletLoaded = false;
  private intervaloPosiciones: any;
  private ultimaLatitud: number | null = null;
  private ultimaLongitud: number | null = null;
  private marcadorInicial: any;

  constructor(
    private vehiculoSeleccionadoService: VehiculoSeleccionadoService,
    private recorridosService: RecorridosService,
    private rutasService: RutasService,
    private navCtrl: NavController,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({
      arrowBackOutline, playOutline, stopOutline, radioButtonOn, location,
      locationOutline, arrowBack, logOutOutline, eyeOutline, closeOutline,
      eyeOffOutline, alertCircleOutline
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
      this.mostrarToast('Por favor selecciona un vehículo primero', 'warning');
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
    this.detenerSeguimiento();
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
      this.mostrarToast('Error al cargar el mapa', 'danger');
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

      this.map = L.map('map', {
        preferCanvas: true,
        zoomControl: true,
        maxZoom: 18,
        minZoom: 10
      }).setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(this.map);

      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          this.obtenerUbicacionActual();
        }
      }, 300);

      console.log('✅ Mapa inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
    }
  }

  obtenerUbicacionActual() {
    if (!('geolocation' in navigator)) {
      this.mostrarToast('Tu navegador no soporta geolocalización', 'danger');
      return;
    }

    console.log('📍 Solicitando ubicación actual...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log('✅ Ubicación obtenida:', { lat, lon, accuracy: position.coords.accuracy });

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

        this.mostrarToast('✅ Ubicación GPS obtenida', 'success');
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

        this.mostrarToast(mensaje, 'danger');
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
    console.log('🎬 ===== INICIANDO RECORRIDO =====');

    if (!this.vehiculoSeleccionado) {
      this.mostrarToast('No hay vehículo seleccionado', 'warning');
      return;
    }

    if (!this.rutaSeleccionadaId) {
      this.mostrarToast('Por favor selecciona una ruta antes de iniciar el recorrido', 'warning');
      return;
    }

    if (!this.posicionActual) {
      this.mostrarToast('⏳ Esperando ubicación GPS...', 'warning');
      this.obtenerUbicacionActual();
      return;
    }

    if (this.recorridoActivo) {
      this.mostrarToast('Ya hay un recorrido en curso', 'warning');
      return;
    }

    try {
      const vehiculoId = this.vehiculoSeleccionado.id;

      if (!vehiculoId) {
        this.mostrarToast('El vehículo no tiene un ID válido', 'danger');
        return;
      }

      const perfilId = environment.tokenSecret;

      const nuevoRecorrido = {
        ruta_id: this.rutaSeleccionadaId,
        vehiculo_id: String(vehiculoId),
        perfil_id: perfilId
      };

      console.log('📤 Enviando solicitud de inicio de recorrido:', nuevoRecorrido);

      this.recorridosService.iniciarRecorrido(nuevoRecorrido).subscribe({
        next: (response) => {
          console.log('✅ Recorrido iniciado - RESPUESTA:', response);

          let recorridoId = response.data?.id ||
                           (response.data as any)?._id ||
                           (response.data as any)?.recorrido_id ||
                           (response as any)?.id;

          this.recorridoActualId = recorridoId;

          if (!this.recorridoActualId) {
            console.error('❌ No se recibió ID del recorrido');
            this.mostrarToast('Error: No se recibió ID del recorrido', 'danger');
            return;
          }

          this.recorridoActivo = true;
          this.posicionesCount = 0;
          this.todasPosiciones = [];
          this.ultimasPosiciones = [];

          console.log(`🔑 Recorrido iniciado con ID: ${this.recorridoActualId}`);

          // ✅ GUARDAR POSICIÓN INICIAL INMEDIATAMENTE
          this.guardarPosicionInicial();

          // Iniciar seguimiento continuo
          this.iniciarSeguimiento();

          this.mostrarToast('✅ Recorrido iniciado correctamente', 'success');
        },
        error: (error: any) => {
          console.error('❌ Error iniciando recorrido:', error);

          const mensaje = error?.error?.message ||
                         error?.error?.errors?.ruta_id?.[0] ||
                         error?.error?.errors?.vehiculo_id?.[0] ||
                         'Error al iniciar recorrido';

          this.mostrarToast(mensaje, 'danger');
        }
      });

    } catch (error: any) {
      console.error('❌ Error:', error);
      this.mostrarToast('Error inesperado al iniciar recorrido', 'danger');
    }
  }

  // ✅ GUARDAR POSICIÓN INICIAL
  guardarPosicionInicial() {
    if (!this.posicionActual || !this.recorridoActualId) {
      console.warn('⚠️ No se puede guardar posición inicial');
      return;
    }

    const { lat, lon } = this.posicionActual;

    console.log('📍 ===== GUARDANDO POSICIÓN INICIAL =====');
    console.log('📍 Coordenadas:', { lat, lon });
    console.log('📍 Tipos:', { lat: typeof lat, lon: typeof lon });

    // Agregar marcador verde para posición inicial
    if (this.map) {
      const iconoInicial = L.divIcon({
        html: `
          <div style="
            background: #2dd36f;
            color: white;
            padding: 8px 12px;
            border-radius: 50%;
            font-weight: bold;
            font-size: 18px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            border: 3px solid white;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            🚩
          </div>
        `,
        className: 'custom-inicio-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      this.marcadorInicial = L.marker([lat, lon], { icon: iconoInicial })
        .addTo(this.map)
        .bindPopup(`
          <div style="text-align: center;">
            <h3 style="margin: 0 0 8px 0; color: #2dd36f;">
              <strong>🚩 Inicio del Recorrido</strong>
            </h3>
            <p style="margin: 4px 0;"><strong>Vehículo:</strong> ${this.vehiculoSeleccionado?.placa}</p>
            <p style="margin: 4px 0; font-size: 11px; color: #666;">
              ${new Date().toLocaleString()}
            </p>
          </div>
        `);
    }

    // Enviar a la API
    this.enviarPosicionAAPI(lat, lon, true);
  }

  iniciarSeguimiento() {
    if (!('geolocation' in navigator)) {
      this.mostrarToast('Geolocalización no disponible', 'danger');
      return;
    }

    console.log('🛰️ ===== INICIANDO SEGUIMIENTO GPS =====');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        console.log(`📍 Nueva posición GPS:`, {
          lat,
          lon,
          accuracy: accuracy.toFixed(2) + 'm',
          timestamp: new Date(position.timestamp).toLocaleTimeString()
        });

        // Solo procesar si tiene buena precisión (menos de 50 metros)
        if (accuracy > 50) {
          console.warn(`⚠️ Precisión baja (${accuracy.toFixed(2)}m), esperando mejor señal...`);
          return;
        }

        this.posicionActual = {
          lat: lat,
          lon: lon,
          fecha_registro: new Date()
        };

        this.actualizarMarcadorEnMapa(lat, lon);
        this.guardarPosicion(position);
      },
      (error: any) => {
        console.error('❌ Error en seguimiento GPS:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Intervalo adicional de envío cada 10 segundos
    this.intervaloPosiciones = setInterval(() => {
      if (this.posicionActual && this.recorridoActivo && this.recorridoActualId) {
        console.log('⏰ Enviando posición periódica (cada 10s)...');
        this.enviarPosicionAAPI(this.posicionActual.lat, this.posicionActual.lon, false);
      }
    }, 10000); // Cada 10 segundos

    console.log('✅ Seguimiento GPS iniciado correctamente');
  }

  actualizarMarcadorEnMapa(lat: number, lon: number) {
    if (!this.map) return;

    if (this.marker) {
      this.marker.setLatLng([lat, lon]);
    } else {
      this.marker = L.marker([lat, lon]).addTo(this.map)
        .bindPopup('Tu ubicación');
    }

    this.todasPosiciones.push([lat, lon]);

    if (this.polyline) {
      this.polyline.setLatLngs(this.todasPosiciones);
    } else if (this.todasPosiciones.length > 1) {
      this.polyline = L.polyline(this.todasPosiciones, {
        color: 'blue',
        weight: 3
      }).addTo(this.map);
    }

    this.map.setView([lat, lon]);
  }

  async guardarPosicion(position: GeolocationPosition) {
    if (!this.recorridoActivo || !this.recorridoActualId) {
      console.warn('⚠️ No hay recorrido activo');
      return;
    }

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Verificar distancia mínima (5 metros)
    if (this.ultimaLatitud !== null && this.ultimaLongitud !== null) {
      const distancia = this.calcularDistancia(
        this.ultimaLatitud, this.ultimaLongitud,
        lat, lon
      );

      if (distancia < 0.005) { // 5 metros
        console.log(`⏭️ Posición muy cercana (${(distancia * 1000).toFixed(1)}m), omitiendo`);
        return;
      }
    }

    this.enviarPosicionAAPI(lat, lon, false);
  }

  // ✅ FUNCIÓN CRÍTICA - ENVIAR POSICIÓN A LA API
  enviarPosicionAAPI(lat: number, lon: number, esPosicionInicial: boolean) {
    if (!this.recorridoActivo || !this.recorridoActualId) {
      console.warn('⚠️ No hay recorrido activo, no se puede enviar posición');
      return;
    }

    console.log('📤 ===== ENVIANDO POSICIÓN A API =====');
    console.log('📍 Recorrido ID:', this.recorridoActualId);
    console.log('📍 Es posición inicial:', esPosicionInicial);

    // ✅ VALIDAR QUE LAT Y LON SEAN NÚMEROS VÁLIDOS
    if (typeof lat !== 'number' || isNaN(lat)) {
      console.error('❌ ERROR: lat no es válido:', lat, typeof lat);
      return;
    }

    if (typeof lon !== 'number' || isNaN(lon)) {
      console.error('❌ ERROR: lon no es válido:', lon, typeof lon);
      return;
    }

    const nuevaPosicion: Posicion = {
      lat: lat,
      lon: lon,
      fecha_registro: new Date()
    };

    try {
      // ✅ ASEGURAR QUE SEAN NÚMEROS
      const dataPosicion = {
        lat: Number(lat),
        lon: Number(lon),
        perfil_id: environment.tokenSecret
      };

      console.log(`📤 Enviando posición ${this.posicionesCount + 1}:`, dataPosicion);
      console.log('🔍 Tipos de datos:', {
        lat: typeof dataPosicion.lat,
        lon: typeof dataPosicion.lon,
        perfil_id: typeof dataPosicion.perfil_id
      });

      this.recorridosService.registrarPosicion(this.recorridoActualId, dataPosicion).subscribe({
        next: (response) => {
          this.posicionesCount++;
          console.log(`✅ Posición ${this.posicionesCount} guardada correctamente`);
          console.log('📥 Response:', response);

          this.ultimaLatitud = lat;
          this.ultimaLongitud = lon;

          this.ultimasPosiciones.unshift(nuevaPosicion);
          if (this.ultimasPosiciones.length > 5) {
            this.ultimasPosiciones.pop();
          }

          if (esPosicionInicial) {
            this.mostrarToast(`✅ Posición inicial registrada (${this.posicionesCount})`, 'success');
          }
        },
        error: (error: any) => {
          console.error('❌ Error guardando posición:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Error body:', error.error);
          
          this.mostrarToast(
            `Error al guardar posición: ${error.error?.message || 'Error desconocido'}`,
            'danger'
          );
        }
      });

    } catch (error) {
      console.error('❌ Error en enviarPosicionAAPI:', error);
    }
  }

  calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  detenerSeguimiento() {
    console.log('🛑 Deteniendo seguimiento GPS...');
    
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('✅ watchPosition detenido');
    }
    
    if (this.intervaloPosiciones) {
      clearInterval(this.intervaloPosiciones);
      this.intervaloPosiciones = null;
      console.log('✅ Intervalo de posiciones detenido');
    }
  }

  async finalizarRecorrido() {
    console.log('🛑 ===== FINALIZANDO RECORRIDO =====');

    if (!this.recorridoActivo || !this.recorridoActualId) {
      this.mostrarToast('No hay recorrido activo', 'warning');
      return;
    }

    this.detenerSeguimiento();

    try {
      const dataFinalizar = {
        perfil_id: environment.tokenSecret
      };

      this.recorridosService.finalizarRecorrido(this.recorridoActualId, dataFinalizar).subscribe({
        next: (response) => {
          console.log('✅ Recorrido finalizado:', response);

          this.recorridoActivo = false;
          this.recorridoActualId = null;
          this.ultimaLatitud = null;
          this.ultimaLongitud = null;

          // Limpiar marcador inicial
          if (this.marcadorInicial && this.map) {
            this.map.removeLayer(this.marcadorInicial);
            this.marcadorInicial = null;
          }

          this.mostrarToast(
            `✅ Recorrido finalizado. ${this.posicionesCount} posiciones registradas`,
            'success'
          );
        },
        error: (error: any) => {
          console.error('❌ Error finalizando recorrido:', error);
          this.mostrarToast(error?.error?.message || 'Error al finalizar recorrido', 'danger');
        }
      });

    } catch (error: any) {
      console.error('❌ Error:', error);
      this.mostrarToast('Error inesperado al finalizar recorrido', 'danger');
    }
  }

  // ==================== RUTAS ====================

  cargarRutasDisponibles() {
    console.log('🔄 Cargando rutas disponibles...');
    this.cargandoRutas = true;
    const perfilId = environment.tokenSecret;

    this.rutasService.obtenerRutas(perfilId).subscribe({
      next: (response) => {
        this.rutasDisponibles = (response.data || []).map((ruta: any) => {
          if (typeof ruta.shape === 'string') {
            try {
              ruta.shape = JSON.parse(ruta.shape);
            } catch (error) {
              console.error(`❌ Error parseando shape para ${ruta.nombre_ruta}:`, error);
              ruta.shape = null;
            }
          }
          return ruta as Ruta;
        });

        this.cargandoRutas = false;
        console.log(`✅ ${this.rutasDisponibles.length} rutas cargadas`);
      },
      error: (error: any) => {
        console.error('❌ Error cargando rutas:', error);
        this.cargandoRutas = false;
        this.mostrarToast('Error al cargar las rutas', 'danger');
      }
    });
  }

  mostrarRutaEnMapa(rutaId: string) {
    if (!this.map) {
      this.mostrarToast('El mapa aún no está listo', 'warning');
      return;
    }

    if (this.rutaSeleccionadaId && this.capasRutas.has(this.rutaSeleccionadaId)) {
      const capaAnterior = this.capasRutas.get(this.rutaSeleccionadaId);
      this.map.removeLayer(capaAnterior);
      this.capasRutas.delete(this.rutaSeleccionadaId);
    }

    const ruta = this.rutasDisponibles.find(r => r.id === rutaId);
    if (!ruta) {
      this.mostrarToast('Ruta no encontrada', 'danger');
      return;
    }

    const shapeParseado = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
    if (!shapeParseado || !shapeParseado.coordinates || shapeParseado.coordinates.length === 0) {
      this.mostrarToast('Esta ruta no tiene coordenadas válidas', 'warning');
      return;
    }

    try {
      this.dibujarRutaEnMapa(ruta);
      this.rutaSeleccionadaId = rutaId;
    } catch (error) {
      console.error('❌ Error al dibujar ruta:', error);
      this.mostrarToast('Error al mostrar la ruta', 'danger');
    }
  }

  private dibujarRutaEnMapa(ruta: Ruta) {
    if (!this.map) return;

    const shapeParseado = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
    if (!shapeParseado || !shapeParseado.coordinates) return;

    try {
      let coordenadas: [number, number][] = [];

      if (shapeParseado.type === 'LineString') {
        coordenadas = shapeParseado.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
      } else if (shapeParseado.type === 'MultiLineString') {
        const primeraLinea = shapeParseado.coordinates[0] || [];
        coordenadas = primeraLinea.map(([lng, lat]: [number, number]) => [lat, lng]);
      }

      if (coordenadas.length < 2) return;

      const polyline = L.polyline(coordenadas, {
        color: '#667eea',
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 5'
      });

      polyline.bindPopup(`<strong>${ruta.nombre_ruta}</strong>`);
      polyline.addTo(this.map);
      this.capasRutas.set(ruta.id, polyline);

      const bounds = polyline.getBounds();
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } catch (error) {
      console.error('❌ Error dibujando ruta:', error);
      throw error;
    }
  }

  ocultarRutaDelMapa(rutaId: string) {
    if (this.capasRutas.has(rutaId)) {
      const capa = this.capasRutas.get(rutaId);
      this.map.removeLayer(capa);
      this.capasRutas.delete(rutaId);
      this.rutaSeleccionadaId = null;
    }
  }

  mostrarTodasRutasEnMapa() {
    if (!this.map) return;

    this.limpiarRutasDelMapa();

    const colores = ['#667eea', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    let colorIndex = 0;

    this.rutasDisponibles.forEach((ruta: Ruta) => {
      const shapeParseado = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;

      if (shapeParseado && shapeParseado.coordinates && shapeParseado.coordinates.length > 0) {
        try {
          let coordenadas: [number, number][] = [];

          if (shapeParseado.type === 'LineString') {
            coordenadas = shapeParseado.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
          } else if (shapeParseado.type === 'MultiLineString') {
            const primeraLinea = shapeParseado.coordinates[0] || [];
            coordenadas = primeraLinea.map(([lng, lat]: [number, number]) => [lat, lng]);
          }

          const color = colores[colorIndex % colores.length];
          const polyline = L.polyline(coordenadas, {
            color: color,
            weight: 3,
            opacity: 0.6
          });

          polyline.bindPopup(`<strong>${ruta.nombre_ruta}</strong>`);
          polyline.addTo(this.map);
          this.capasRutas.set(ruta.id, polyline);

          colorIndex++;
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
  }

  obtenerCoordenadasLength(ruta: Ruta): number {
    if (!ruta.shape) return 0;

    const shapeParseado = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
    if (!shapeParseado || !shapeParseado.coordinates) return 0;

    if (shapeParseado.type === 'MultiLineString' && Array.isArray(shapeParseado.coordinates[0])) {
      return shapeParseado.coordinates[0].length;
    }

    return shapeParseado.coordinates.length || 0;
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