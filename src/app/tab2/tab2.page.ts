import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonCardSubtitle, IonGrid, IonRow, IonCol, IonItem, IonLabel, IonList,
  NavController, IonText, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, playOutline, stopOutline, locationOutline, location, radioButtonOn, arrowBack, arrowBackOutline, eyeOutline, closeOutline, eyeOffOutline, alertCircleOutline } from 'ionicons/icons';
import { VehiculoSeleccionadoService } from '../services/vehiculo-seleccionado';
import { RecorridosService } from '../services/recorridos';
import { RutasService } from '../services/rutas';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

declare var L: any;

// ✅ INTERFACES
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
  // Vehículo
  vehiculoSeleccionado: Vehiculo | null = null;

  // Recorrido
  recorridoActivo = false;
  recorridoActualId: string | null = null;
  posicionActual: Posicion | null = null;
  posicionesCount = 0;
  ultimasPosiciones: Posicion[] = [];

  // Rutas
  rutasDisponibles: Ruta[] = [];
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

      this.map = L.map('map', {
        preferCanvas: true,
        zoomControl: true,
        maxZoom: 18,
        minZoom: 10
      }).setView([lat, lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 10,
        maxNativeZoom: 18,
        tms: false,
        crossOrigin: true,
        errorTileUrl: '',
        continuousWorld: false,
        noWrap: false,
        bounds: L.latLngBounds(L.latLng(2.0, -79.0), L.latLng(6.0, -69.0))
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

    if (!this.rutaSeleccionadaId) {
      alert('Por favor selecciona una ruta antes de iniciar el recorrido');
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
      // ✅ Usar el ID real del vehículo seleccionado (NO generar un nuevo UUID)
      const vehiculoId = this.vehiculoSeleccionado.id?.toString() || '';

      if (!vehiculoId) {
        alert('El vehículo no tiene un ID válido');
        console.error('❌ Vehículo sin ID:', this.vehiculoSeleccionado);
        return;
      }

      // ✅ Usar el perfil_id correcto
      const perfilId = environment.tokenSecret;

      const nuevoRecorrido = {
        ruta_id: this.rutaSeleccionadaId,
        vehiculo_id: vehiculoId,
        perfil_id: perfilId
      };

      console.log('📤 Enviando recorrido:', nuevoRecorrido);
      console.log('🚗 Datos del vehículo usado:', {
        id: this.vehiculoSeleccionado.id,
        placa: this.vehiculoSeleccionado.placa,
        marca: this.vehiculoSeleccionado.marca
      });

      this.recorridosService.iniciarRecorrido(nuevoRecorrido).subscribe({
        next: (response) => {
          console.log('✅ Recorrido iniciado - RESPUESTA COMPLETA:', response);
          console.log('📋 Estructura de response:', {
            tieneData: !!response.data,
            dataTipo: typeof response.data,
            dataKeys: Object.keys(response.data || {}),
            id: response.data?.id,
            _id: (response.data as any)?._id,
            recorrido_id: (response.data as any)?.recorrido_id,
            message: response.message,
            allKeys: Object.keys(response)
          });

          // ✅ Intentar obtener el ID de diferentes formas
          let recorridoId = response.data?.id ||
                           (response.data as any)?._id ||
                           (response.data as any)?.recorrido_id ||
                           (response as any)?.id;

          console.log('🔍 ID obtenido de:', {
            'response.data?.id': response.data?.id,
            'response.data?._id': (response.data as any)?._id,
            'response.data?.recorrido_id': (response.data as any)?.recorrido_id,
            'response?.id': (response as any)?.id,
            idFinal: recorridoId
          });

          // ✅ Guardar el ID del recorrido retornado por la API
          this.recorridoActualId = recorridoId;

          if (!this.recorridoActualId) {
            console.error('❌ La API no retornó un ID de recorrido válido');
            console.error('❌ RESPUESTA COMPLETA:', JSON.stringify(response, null, 2));
            alert('Error: No se recibió ID del recorrido. Verifica los logs de consola.');
            return;
          }

          this.recorridoActivo = true;
          this.posicionesCount = 0;
          this.todasPosiciones = [];
          this.ultimasPosiciones = [];

          console.log(`🔑 ID del recorrido guardado: ${this.recorridoActualId}`);
          this.iniciarSeguimiento();
          alert('Recorrido iniciado correctamente');
        },
        error: (error) => {
          console.error('❌ Error iniciando recorrido:', error);
          console.error('❌ Response:', error.error);

          const mensaje = error?.error?.message ||
                         error?.error?.errors?.ruta_id?.[0] ||
                         error?.error?.errors?.vehiculo_id?.[0] ||
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
    console.log(`📋 ID del recorrido a finalizar: ${this.recorridoActualId}`);

    if (!this.recorridoActivo || !this.recorridoActualId) {
      alert('No hay recorrido activo');
      console.warn('⚠️ recorridoActivo:', this.recorridoActivo);
      console.warn('⚠️ recorridoActualId:', this.recorridoActualId);
      return;
    }

    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    try {
      const dataFinalizar = {
        perfil_id: environment.tokenSecret
      };

      console.log('📤 Datos a enviar:', {
        recorridoId: this.recorridoActualId,
        data: dataFinalizar
      });

      this.recorridosService.finalizarRecorrido(this.recorridoActualId, dataFinalizar).subscribe({
        next: (response) => {
          console.log('✅ Recorrido finalizado:', response);
          console.log('📊 Resumen del recorrido:', {
            id: response.data?.id,
            estado: response.data?.estado,
            fecha_fin: response.data?.fecha_fin,
            total_posiciones: response.data?.total_posiciones
          });

          this.recorridoActivo = false;
          this.recorridoActualId = null;

          alert(`Recorrido finalizado. Total de posiciones: ${this.posicionesCount}`);
        },
        error: (error) => {
          console.error('❌ Error finalizando recorrido:', error);
          console.error('❌ Status:', error.status);
          console.error('❌ Message:', error.message);
          console.error('❌ Response:', error.error);

          const mensaje = error?.error?.message ||
                         'Error al finalizar recorrido';

          alert(mensaje);
        }
      });

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Error inesperado al finalizar recorrido');
    }
  }

  // ==================== RUTAS ====================

  cargarRutasDisponibles() {
    console.log('🔄 Cargando rutas disponibles...');
    this.cargandoRutas = true;
    const perfilId = environment.tokenSecret;

    this.rutasService.obtenerRutas(perfilId).subscribe({
      next: (response) => {
        console.log('📦 Respuesta de rutas:', response);

        // ✅ SOLUCIÓN: Parsear el shape si viene como string
        this.rutasDisponibles = (response.data || []).map((ruta: any) => {
          if (typeof ruta.shape === 'string') {
            try {
              ruta.shape = JSON.parse(ruta.shape);
              console.log(`✅ Shape parseado para ruta: ${ruta.nombre_ruta}`);
            } catch (error) {
              console.error(`❌ Error parseando shape para ${ruta.nombre_ruta}:`, error);
              ruta.shape = null;
            }
          }
          return ruta as Ruta;
        });

        this.cargandoRutas = false;
        console.log(`✅ ${this.rutasDisponibles.length} rutas cargadas`);

        // Mostrar detalles de cada ruta
        this.rutasDisponibles.forEach(ruta => {
          const shapeParseado = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;
          console.log(`📍 Ruta: ${ruta.nombre_ruta}`, {
            id: ruta.id,
            tieneShape: !!shapeParseado,
            tipoShape: shapeParseado?.type,
            coordenadas: shapeParseado?.coordinates?.length || 0
          });
        });
      },
      error: (error) => {
        console.error('❌ Error cargando rutas:', error);
        console.error('❌ Detalles del error:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        this.cargandoRutas = false;
        alert('Error al cargar las rutas. Verifica tu conexión.');
      }
    });
  }

  mostrarRutaEnMapa(rutaId: string) {
    console.log('🗺️ Mostrando ruta en mapa:', rutaId);

    if (!this.map) {
      console.warn('⚠️ El mapa no está inicializado');
      alert('El mapa aún no está listo. Espera un momento.');
      return;
    }

    // Si hay una ruta seleccionada previamente, ocultarla
    if (this.rutaSeleccionadaId && this.capasRutas.has(this.rutaSeleccionadaId)) {
      const capaAnterior = this.capasRutas.get(this.rutaSeleccionadaId);
      this.map.removeLayer(capaAnterior);
      this.capasRutas.delete(this.rutaSeleccionadaId);
    }

    // ✅ Buscar la ruta en las rutas ya cargadas en memoria
    const ruta = this.rutasDisponibles.find(r => r.id === rutaId);

    if (!ruta) {
      console.error('❌ Ruta no encontrada en memoria:', rutaId);
      console.log('📋 Rutas disponibles:', this.rutasDisponibles.map(r => ({id: r.id, nombre: r.nombre_ruta})));
      alert('Ruta no encontrada. Por favor recarga las rutas.');
      return;
    }

    console.log('📍 Ruta encontrada en memoria:', ruta);

    // Parsear si es string
    const shapeParseado = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;

    // Verificar si tiene geometría
    if (!shapeParseado || !shapeParseado.coordinates || shapeParseado.coordinates.length === 0) {
      console.warn('⚠️ La ruta no tiene geometría válida:', ruta);
      alert('Esta ruta no tiene coordenadas para mostrar en el mapa');
      return;
    }

    // Dibujar la ruta en el mapa
    try {
      this.dibujarRutaEnMapa(ruta);
      this.rutaSeleccionadaId = rutaId;
      console.log('✅ Ruta mostrada correctamente en el mapa');
    } catch (error) {
      console.error('❌ Error al dibujar ruta:', error);
      alert('Error al mostrar la ruta en el mapa');
    }
  }

  private dibujarRutaEnMapa(ruta: Ruta) {
    console.log('🎨 Dibujando ruta:', ruta.nombre_ruta);

    if (!this.map) {
      console.error('❌ Mapa no disponible');
      return;
    }

    // Parsear shape si es string
    const shapeParseado = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;

    if (!shapeParseado || !shapeParseado.coordinates) {
      console.error('❌ Ruta sin geometría válida');
      return;
    }

    try {
      let coordenadas: [number, number][] = [];

      // ✅ Manejar tanto LineString como MultiLineString
      if (shapeParseado.type === 'LineString') {
        coordenadas = shapeParseado.coordinates.map(([lng, lat]: [number, number]) => [lat, lng]);
      } else if (shapeParseado.type === 'MultiLineString') {
        // Para MultiLineString, tomar la primera línea
        const primeraLinea = shapeParseado.coordinates[0] || [];
        coordenadas = primeraLinea.map(([lng, lat]: [number, number]) => [lat, lng]);
        console.log(`📐 MultiLineString con ${shapeParseado.coordinates.length} segmentos, usando primer segmento`);
      } else {
        console.warn(`⚠️ Tipo de geometría no soportado: ${shapeParseado.type}`);
        return;
      }

      console.log('📐 Coordenadas convertidas:', coordenadas.slice(0, 3));
      console.log(`📏 Total de puntos: ${coordenadas.length}`);

      if (coordenadas.length < 2) {
        console.error('❌ No hay suficientes coordenadas para dibujar');
        return;
      }

      // ✅ Optimizar: simplificar coordenadas si hay demasiadas
      const coordenadasOptimizadas = this.simplificarCoordenadas(coordenadas, 0.0001);
      console.log(`✂️ Coordenadas optimizadas: ${coordenadasOptimizadas.length} puntos`);

      const polyline = L.polyline(coordenadasOptimizadas, {
        color: '#667eea',
        weight: 4,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '5, 5',
        pane: 'overlayPane',
        smoothFactor: 1.0
      });

      polyline.bindPopup(`
        <div class="ruta-popup">
          <strong>${ruta.nombre_ruta}</strong>
          <br>
          <small>Puntos: ${coordenadasOptimizadas.length}</small>
          <br>
          <small>Tipo: ${shapeParseado.type}</small>
        </div>
      `);

      polyline.addTo(this.map);
      this.capasRutas.set(ruta.id, polyline);

      const bounds = polyline.getBounds();
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });

      console.log(`✅ Ruta "${ruta.nombre_ruta}" dibujada exitosamente`);
    } catch (error) {
      console.error('❌ Error dibujando ruta:', error);
      throw error;
    }
  }

  // ✅ Método para simplificar coordenadas (algoritmo de Ramer-Douglas-Peucker)
  private simplificarCoordenadas(coordenadas: [number, number][], tolerancia: number): [number, number][] {
    if (coordenadas.length <= 2) return coordenadas;

    const dmax = (p1: [number, number], p2: [number, number], line: [number, number][]) => {
      let max = 0;
      let index = 0;
      for (let i = 1; i < line.length - 1; i++) {
        const d = Math.abs((line[i][1] - p1[1]) * (p2[0] - p1[0]) - (line[i][0] - p1[0]) * (p2[1] - p1[1])) /
                  Math.sqrt(Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[0] - p1[0], 2));
        if (d > max) {
          index = i;
          max = d;
        }
      }
      return { index, max };
    };

    const rdp = (points: [number, number][], tol: number): [number, number][] => {
      if (points.length < 3) return points;
      const { index, max } = dmax(points[0], points[points.length - 1], points);
      if (max > tol) {
        const l1 = rdp(points.slice(0, index + 1), tol);
        const l2 = rdp(points.slice(index), tol);
        return [...l1.slice(0, -1), ...l2];
      } else {
        return [points[0], points[points.length - 1]];
      }
    };

    return rdp(coordenadas, tolerancia);
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
      alert('El mapa aún no está listo. Espera un momento.');
      return;
    }

    // Limpiar rutas previas
    this.limpiarRutasDelMapa();

    const colores = ['#667eea', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];
    let colorIndex = 0;
    let rutasDibujadas = 0;

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
          rutasDibujadas++;
          console.log(`✅ Ruta "${ruta.nombre_ruta}" agregada al mapa`);
        } catch (error) {
          console.error(`❌ Error dibujando ruta ${ruta.nombre_ruta}:`, error);
        }
      }
    });

    if (rutasDibujadas === 0) {
      alert('No hay rutas con geometría válida para mostrar');
      return;
    }

    if (this.capasRutas.size > 0) {
      const grupo = L.featureGroup(Array.from(this.capasRutas.values()));
      this.map.fitBounds(grupo.getBounds(), { padding: [50, 50] });
    }

    console.log(`✅ ${rutasDibujadas} rutas mostradas en el mapa`);
  }

  limpiarRutasDelMapa() {
    this.capasRutas.forEach(capa => {
      this.map.removeLayer(capa);
    });
    this.capasRutas.clear();
    this.rutaSeleccionadaId = null;
    console.log('✅ Todas las rutas eliminadas del mapa');
  }

  obtenerNombreRuta(rutaId: string): string {
    const ruta = this.rutasDisponibles.find(r => r.id === rutaId);
    return ruta?.nombre_ruta || 'Ruta sin nombre';
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

  // ==================== MÉTODOS DEL TEMPLATE ====================

  obtenerCoordenadasLength(ruta: Ruta): number {
    if (!ruta.shape) return 0;

    const shapeParseado = typeof ruta.shape === 'string' ? JSON.parse(ruta.shape) : ruta.shape;

    if (!shapeParseado || !shapeParseado.coordinates) return 0;

    if (shapeParseado.type === 'MultiLineString' && Array.isArray(shapeParseado.coordinates[0])) {
      return shapeParseado.coordinates[0].length;
    }

    return shapeParseado.coordinates.length || 0;
  }
}
