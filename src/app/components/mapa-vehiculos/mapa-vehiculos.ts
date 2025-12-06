// Archivo: src/app/components/mapa-vehiculos/mapa-vehiculos.ts
// ✅ VERSIÓN COMPLETA CORREGIDA - Lee coordenadas del campo "geom" (GeoJSON)

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonSpinner, IonRefresher,
  IonRefresherContent, NavController, IonSearchbar, IonChip,
  ToastController, AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, refreshOutline, carOutline, locationOutline,
  eyeOutline, eyeOffOutline, navigateOutline, searchOutline,
  alertCircleOutline, stopCircleOutline
} from 'ionicons/icons';
import { RecorridosService } from '../../services/recorridos';
import { VehiculosService } from '../../services/vehiculos';
import { environment } from '../../../environments/environment';

declare var L: any;

// ✅ Interfaces
interface PosicionNormalizada {
  lat: number;
  lon: number;
  fecha_registro?: string;
}

interface VehiculoConPosicion {
  vehiculo: any;
  recorrido: any;
  ultimaPosicion: PosicionNormalizada | null;
  visible: boolean;
  marker?: any;
  polyline?: any;
}

@Component({
  selector: 'app-mapa-vehiculos',
  templateUrl: './mapa-vehiculos.html',
  styleUrls: ['./mapa-vehiculos.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
    IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonSpinner, IonRefresher,
    IonRefresherContent, IonSearchbar, IonChip
  ]
})
export class MapaVehiculosPage implements OnInit, OnDestroy, AfterViewInit {
  private map: any;
  private leafletLoaded = false;
  private actualizacionInterval: any;

  vehiculosConPosicion: VehiculoConPosicion[] = [];
  cargando = false;
  busqueda = '';
  errorMensaje = '';

  constructor(
    private recorridosService: RecorridosService,
    private vehiculosService: VehiculosService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({
      arrowBackOutline, refreshOutline, carOutline, locationOutline,
      eyeOutline, eyeOffOutline, navigateOutline, searchOutline,
      alertCircleOutline, stopCircleOutline
    });
  }

  ngOnInit() {
    console.log('🗺️ Componente de mapa de vehículos inicializado');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.cargarLeaflet();
      this.cargarVehiculosYPosiciones();
    }, 300);
  }

  ngOnDestroy() {
    if (this.actualizacionInterval) {
      clearInterval(this.actualizacionInterval);
    }
    if (this.map) {
      this.map.remove();
    }
  }

  // ==================== LEAFLET ====================

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
      this.errorMensaje = 'Error al cargar el mapa. Por favor recarga la página.';
    };
    document.head.appendChild(script);
  }

  inicializarMapa() {
    const mapElement = document.getElementById('map-vehiculos');

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

      this.map = L.map('map-vehiculos', {
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
        }
      }, 300);

      console.log('✅ Mapa de vehículos inicializado');
    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      this.errorMensaje = 'Error al inicializar el mapa';
    }
  }

  // ==================== CARGA DE DATOS ====================

  async cargarVehiculosYPosiciones() {
    this.cargando = true;
    this.errorMensaje = '';
    const perfilId = environment.tokenSecret;

    console.log('🔄 Iniciando carga de datos...');

    try {
      this.vehiculosService.obtenerVehiculos().subscribe({
        next: (vehiculosResponse) => {
          const todosVehiculos = vehiculosResponse.data || [];
          console.log('🚗 Total de vehículos cargados:', todosVehiculos.length);

          this.recorridosService.obtenerRecorridosPorPerfil(perfilId).subscribe({
            next: (recorridosResponse) => {
              const recorridos = recorridosResponse.data || [];
              console.log('📍 Total de recorridos obtenidos:', recorridos.length);

              // Filtrar recorridos activos (sin ts_fin)
              const recorridosActivos = recorridos.filter((r: any) => {
                const tieneInicio = !!r.ts_inicio;
                const noTieneFin = !r.ts_fin || r.ts_fin === null || r.ts_fin === '';
                return tieneInicio && noTieneFin;
              });

              console.log('✅ Recorridos activos (sin ts_fin):', recorridosActivos.length);

              if (recorridosActivos.length === 0) {
                console.warn('⚠️ No hay recorridos activos');
                this.errorMensaje = 'No hay vehículos con recorridos activos.';
                this.cargando = false;
                return;
              }

              this.procesarRecorridosActivos(todosVehiculos, recorridosActivos);
            },
            error: (error) => {
              console.error('❌ Error cargando recorridos:', error);
              this.errorMensaje = 'Error al cargar los recorridos.';
              this.cargando = false;
            }
          });
        },
        error: (error) => {
          console.error('❌ Error cargando vehículos:', error);
          this.errorMensaje = 'Error al cargar los vehículos';
          this.cargando = false;
        }
      });
    } catch (error) {
      console.error('❌ Error general:', error);
      this.errorMensaje = 'Error inesperado al cargar los datos';
      this.cargando = false;
    }
  }

  // ✅ FUNCIÓN CRÍTICA CORREGIDA - Extrae coordenadas del campo "geom"
  private normalizarPosicion(pos: any): PosicionNormalizada {
    console.log('🔍 Normalizando posición - Estructura completa:', JSON.stringify(pos, null, 2));

    let lat: number | undefined;
    let lon: number | undefined;

    // ✅ PRIORIDAD 1: Intentar extraer del campo "geom" (formato GeoJSON)
    if (pos.geom) {
      try {
        let geomObj;

        // Si geom es string, parsearlo
        if (typeof pos.geom === 'string') {
          geomObj = JSON.parse(pos.geom);
          console.log('📍 geom parseado desde string:', geomObj);
        } else {
          geomObj = pos.geom;
          console.log('📍 geom ya es objeto:', geomObj);
        }

        // GeoJSON Point: { "type": "Point", "coordinates": [lon, lat] }
        if (geomObj.type === 'Point' && Array.isArray(geomObj.coordinates)) {
          [lon, lat] = geomObj.coordinates; // ⚠️ IMPORTANTE: GeoJSON es [lon, lat]
          console.log('✅ Coordenadas extraídas de geom (GeoJSON):', { lat, lon });
        }
      } catch (error) {
        console.error('❌ Error parseando geom:', error);
      }
    }

    // ✅ PRIORIDAD 2: Intentar otros formatos si no encontró en geom
    if (!lat || !lon) {
      lat = pos.lat || pos.latitude || pos.latitud || pos.y ||
            pos.Lat || pos.Latitude || pos.LATITUDE ||
            pos.coord?.lat || pos.coordinates?.lat || pos.location?.lat;

      lon = pos.lon || pos.lng || pos.longitude || pos.longitud || pos.x ||
            pos.Lon || pos.Lng || pos.Longitude || pos.LONGITUDE ||
            pos.coord?.lon || pos.coord?.lng || pos.coordinates?.lon || pos.location?.lon;
    }

    // ✅ PRIORIDAD 3: Intentar extraer de un posible array de coordenadas [lon, lat]
    if (!lat && !lon && Array.isArray(pos.coordinates)) {
      [lon, lat] = pos.coordinates;
      console.log('✅ Coordenadas extraídas de array coordinates:', { lat, lon });
    }

    // ✅ PRIORIDAD 4: Intentar extraer de un objeto geometry (formato GeoJSON alternativo)
    if (!lat && !lon && pos.geometry && pos.geometry.coordinates) {
      [lon, lat] = pos.geometry.coordinates;
      console.log('✅ Coordenadas extraídas de geometry.coordinates:', { lat, lon });
    }

    // Fecha - también puede venir como capturado_ts
    const fecha = pos.fecha_registro || pos.created_at || pos.timestamp ||
                  pos.ts_registro || pos.fecha || pos.date || pos.capturado_ts;

    const resultado = {
      lat: Number(lat),
      lon: Number(lon),
      fecha_registro: fecha
    };

    console.log('📍 Resultado final de normalización:', resultado);
    console.log('📍 Tipos:', {
      lat: typeof resultado.lat,
      lon: typeof resultado.lon,
      esNumeroLat: !isNaN(resultado.lat),
      esNumeroLon: !isNaN(resultado.lon)
    });

    return resultado;
  }

  procesarRecorridosActivos(todosVehiculos: any[], recorridosActivos: any[]) {
    this.vehiculosConPosicion = [];
    let procesados = 0;
    const perfilId = environment.tokenSecret;

    recorridosActivos.forEach((recorrido, index) => {
      const vehiculo = todosVehiculos.find(v => v.id.toString() === recorrido.vehiculo_id.toString());

      if (!vehiculo) {
        procesados++;
        if (procesados === recorridosActivos.length) {
          this.finalizarCarga();
        }
        return;
      }

      this.recorridosService.obtenerPosiciones(recorrido.id, perfilId).subscribe({
        next: (posicionesResponse) => {
          const posiciones = posicionesResponse.data || [];
          console.log(`📍 ${posiciones.length} posiciones obtenidas para ${vehiculo.placa}`);

          if (posiciones.length > 0) {
            console.log('🔍 Primera posición (estructura):', posiciones[0]);
            console.log('🔍 Última posición (estructura):', posiciones[posiciones.length - 1]);
          }

          const posicionesNormalizadas: PosicionNormalizada[] = posiciones.map((pos: any) =>
            this.normalizarPosicion(pos)
          );

          const posicionesValidas: PosicionNormalizada[] = posicionesNormalizadas.filter((p: PosicionNormalizada) => {
            const latValida = p.lat !== undefined && p.lat !== null && !isNaN(p.lat) && isFinite(p.lat) && p.lat !== 0;
            const lonValida = p.lon !== undefined && p.lon !== null && !isNaN(p.lon) && isFinite(p.lon) && p.lon !== 0;

            if (!latValida || !lonValida) {
              console.warn('⚠️ Posición inválida filtrada:', p);
            }

            return latValida && lonValida;
          });

          console.log(`✅ Posiciones válidas: ${posicionesValidas.length} de ${posiciones.length}`);

          const ultimaPosicion = posicionesValidas.length > 0 ? posicionesValidas[posicionesValidas.length - 1] : null;

          if (ultimaPosicion) {
            console.log(`📍 Última posición válida para ${vehiculo.placa}:`, {
              lat: ultimaPosicion.lat,
              lon: ultimaPosicion.lon,
              fecha: ultimaPosicion.fecha_registro
            });
          }

          const vehiculoConPosicion: VehiculoConPosicion = {
            vehiculo: vehiculo,
            recorrido: recorrido,
            ultimaPosicion: ultimaPosicion,
            visible: true
          };

          this.vehiculosConPosicion.push(vehiculoConPosicion);

          if (ultimaPosicion && ultimaPosicion.lat && ultimaPosicion.lon && this.map) {
            this.agregarMarcadorVehiculo(vehiculoConPosicion);

            if (posicionesValidas.length > 1) {
              this.dibujarTrayectoria(vehiculoConPosicion, posicionesValidas);
            }
          }

          procesados++;

          if (procesados === recorridosActivos.length) {
            this.finalizarCarga();
          }
        },
        error: (error) => {
          console.error(`❌ Error obteniendo posiciones para recorrido ${recorrido.id}:`, error);

          const vehiculoConPosicion: VehiculoConPosicion = {
            vehiculo: vehiculo,
            recorrido: recorrido,
            ultimaPosicion: null,
            visible: true
          };
          this.vehiculosConPosicion.push(vehiculoConPosicion);

          procesados++;

          if (procesados === recorridosActivos.length) {
            this.finalizarCarga();
          }
        }
      });
    });
  }

  private finalizarCarga() {
    this.cargando = false;
    console.log(`✅ Carga completa: ${this.vehiculosConPosicion.length} vehículos con posición`);

    const conPosicion = this.vehiculosConPosicion.filter(v => v.ultimaPosicion !== null);
    console.log(`📊 Vehículos con posición GPS válida: ${conPosicion.length}`);

    if (conPosicion.length > 0) {
      setTimeout(() => this.mostrarTodosLosVehiculos(), 500);
    }

    this.iniciarActualizacionAutomatica();
  }

  // ==================== MARCADORES Y TRAYECTORIA ====================

  agregarMarcadorVehiculo(vehiculoConPosicion: VehiculoConPosicion) {
    if (!this.map || !vehiculoConPosicion.ultimaPosicion) {
      return;
    }

    const { lat, lon } = vehiculoConPosicion.ultimaPosicion;
    const { marca, placa, modelo } = vehiculoConPosicion.vehiculo;

    if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
      console.error(`❌ Coordenadas inválidas para ${placa}:`, { lat, lon });
      return;
    }

    const iconoHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
        border: 2px solid white;
      ">
        🚗 ${placa}
      </div>
    `;

    const customIcon = L.divIcon({
      html: iconoHTML,
      className: 'custom-vehicle-marker',
      iconSize: [100, 40],
      iconAnchor: [50, 40]
    });

    const marker = L.marker([lat, lon], { icon: customIcon });

    const fechaStr = vehiculoConPosicion.ultimaPosicion.fecha_registro
      ? new Date(vehiculoConPosicion.ultimaPosicion.fecha_registro).toLocaleString()
      : 'Sin fecha';

    marker.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 16px;">
          <strong>${marca}</strong>
        </h3>
        <p style="margin: 5px 0;"><strong>Placa:</strong> ${placa}</p>
        <p style="margin: 5px 0;"><strong>Modelo:</strong> ${modelo}</p>
        <p style="margin: 5px 0; font-size: 11px; color: #666;">
          <strong>Última actualización:</strong><br>
          ${fechaStr}
        </p>
        <p style="margin: 5px 0; font-size: 11px; color: #666;">
          📍 ${lat.toFixed(6)}, ${lon.toFixed(6)}
        </p>
      </div>
    `);

    marker.addTo(this.map);
    vehiculoConPosicion.marker = marker;

    console.log(`✅ Marcador agregado para ${placa} en [${lat}, ${lon}]`);
  }

  dibujarTrayectoria(vehiculoConPosicion: VehiculoConPosicion, posiciones: PosicionNormalizada[]) {
    if (!this.map || posiciones.length < 2) {
      return;
    }

    const coordenadas: [number, number][] = posiciones.map((p: PosicionNormalizada) => [p.lat, p.lon]);

    const polyline = L.polyline(coordenadas, {
      color: '#4ecdc4',
      weight: 3,
      opacity: 0.7,
      lineCap: 'round',
      lineJoin: 'round'
    });

    polyline.addTo(this.map);
    vehiculoConPosicion.polyline = polyline;

    console.log(`✅ Trayectoria dibujada con ${coordenadas.length} puntos`);
  }

  // ==================== FINALIZAR RECORRIDO ====================

  async finalizarRecorrido(vehiculoConPosicion: VehiculoConPosicion) {
    const alert = await this.alertController.create({
      header: '¿Finalizar Recorrido?',
      message: `¿Estás seguro de finalizar el recorrido del vehículo <strong>${vehiculoConPosicion.vehiculo.placa}</strong>?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          role: 'confirm',
          handler: () => {
            this.confirmarFinalizacion(vehiculoConPosicion);
          }
        }
      ]
    });

    await alert.present();
  }

  private confirmarFinalizacion(vehiculoConPosicion: VehiculoConPosicion) {
    const perfilId = environment.tokenSecret;
    const recorridoId = vehiculoConPosicion.recorrido.id;

    console.log(`🛑 Finalizando recorrido ${recorridoId} del vehículo ${vehiculoConPosicion.vehiculo.placa}`);

    this.recorridosService.finalizarRecorrido(recorridoId, { perfil_id: perfilId }).subscribe({
      next: (response) => {
        console.log('✅ Recorrido finalizado:', response);
        this.mostrarToast(
          `Recorrido del vehículo ${vehiculoConPosicion.vehiculo.placa} finalizado correctamente`,
          'success'
        );

        // Remover del mapa
        if (vehiculoConPosicion.marker && this.map) {
          this.map.removeLayer(vehiculoConPosicion.marker);
        }
        if (vehiculoConPosicion.polyline && this.map) {
          this.map.removeLayer(vehiculoConPosicion.polyline);
        }

        // Remover de la lista
        this.vehiculosConPosicion = this.vehiculosConPosicion.filter(
          v => v.recorrido.id !== recorridoId
        );

        // Recargar si no quedan vehículos
        if (this.vehiculosConPosicion.length === 0) {
          this.errorMensaje = 'No hay más vehículos con recorridos activos.';
        }
      },
      error: (error) => {
        console.error('❌ Error finalizando recorrido:', error);
        this.mostrarToast(
          error?.error?.message || 'Error al finalizar el recorrido',
          'danger'
        );
      }
    });
  }

  // ==================== INTERACCIONES ====================

  toggleVisibilidadVehiculo(vehiculoConPosicion: VehiculoConPosicion) {
    vehiculoConPosicion.visible = !vehiculoConPosicion.visible;

    if (vehiculoConPosicion.marker) {
      if (vehiculoConPosicion.visible) {
        vehiculoConPosicion.marker.addTo(this.map);
        if (vehiculoConPosicion.polyline) {
          vehiculoConPosicion.polyline.addTo(this.map);
        }
      } else {
        this.map.removeLayer(vehiculoConPosicion.marker);
        if (vehiculoConPosicion.polyline) {
          this.map.removeLayer(vehiculoConPosicion.polyline);
        }
      }
    }
  }

  async centrarEnVehiculo(vehiculoConPosicion: VehiculoConPosicion) {
    if (!this.map) {
      await this.mostrarToast('El mapa no está inicializado', 'warning');
      return;
    }

    if (!vehiculoConPosicion.ultimaPosicion) {
      await this.mostrarToast(
        `${vehiculoConPosicion.vehiculo.placa} aún no tiene posiciones GPS registradas`,
        'warning'
      );
      return;
    }

    const { lat, lon } = vehiculoConPosicion.ultimaPosicion;

    if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
      await this.mostrarToast(
        `Las coordenadas de ${vehiculoConPosicion.vehiculo.placa} no son válidas`,
        'danger'
      );
      return;
    }

    this.map.setView([lat, lon], 16);

    if (vehiculoConPosicion.marker) {
      vehiculoConPosicion.marker.openPopup();
    }

    await this.mostrarToast(
      `Mapa centrado en ${vehiculoConPosicion.vehiculo.placa}`,
      'success'
    );
  }

  mostrarTodosLosVehiculos() {
    if (!this.map || this.vehiculosConPosicion.length === 0) {
      return;
    }

    const bounds = L.latLngBounds([]);

    this.vehiculosConPosicion.forEach(v => {
      if (v.ultimaPosicion) {
        bounds.extend([v.ultimaPosicion.lat, v.ultimaPosicion.lon]);
        v.visible = true;
        if (v.marker) {
          v.marker.addTo(this.map);
        }
        if (v.polyline) {
          v.polyline.addTo(this.map);
        }
      }
    });

    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // ==================== ACTUALIZACIÓN ====================

  iniciarActualizacionAutomatica() {
    if (this.actualizacionInterval) {
      clearInterval(this.actualizacionInterval);
    }

    this.actualizacionInterval = setInterval(() => {
      console.log('🔄 Actualizando posiciones automáticamente...');
      this.actualizarPosiciones();
    }, 30000);
  }

  actualizarPosiciones() {
    const perfilId = environment.tokenSecret;

    this.vehiculosConPosicion.forEach(vehiculoConPosicion => {
      this.recorridosService.obtenerPosiciones(vehiculoConPosicion.recorrido.id, perfilId).subscribe({
        next: (posicionesResponse) => {
          const posiciones = posicionesResponse.data || [];

          const posicionesNormalizadas: PosicionNormalizada[] = posiciones.map((pos: any) =>
            this.normalizarPosicion(pos)
          );

          const posicionesValidas: PosicionNormalizada[] = posicionesNormalizadas.filter((p: PosicionNormalizada) => {
            const latValida = p.lat !== undefined && p.lat !== null && !isNaN(p.lat) && isFinite(p.lat) && p.lat !== 0;
            const lonValida = p.lon !== undefined && p.lon !== null && !isNaN(p.lon) && isFinite(p.lon) && p.lon !== 0;
            return latValida && lonValida;
          });

          const nuevaPosicion: PosicionNormalizada | null = posicionesValidas.length > 0 ? posicionesValidas[posicionesValidas.length - 1] : null;

          if (nuevaPosicion && nuevaPosicion.lat && nuevaPosicion.lon) {
            vehiculoConPosicion.ultimaPosicion = nuevaPosicion;

            if (vehiculoConPosicion.marker) {
              this.map.removeLayer(vehiculoConPosicion.marker);
            }
            if (vehiculoConPosicion.polyline) {
              this.map.removeLayer(vehiculoConPosicion.polyline);
            }

            if (vehiculoConPosicion.visible) {
              this.agregarMarcadorVehiculo(vehiculoConPosicion);
              if (posicionesValidas.length > 1) {
                this.dibujarTrayectoria(vehiculoConPosicion, posicionesValidas);
              }
            }
          }
        },
        error: (error: any) => {
          console.error('❌ Error actualizando posición:', error);
        }
      });
    });
  }

  refrescarManualmente(event?: any) {
    console.log('🔄 Refrescando manualmente...');

    this.vehiculosConPosicion.forEach(v => {
      if (v.marker) {
        this.map.removeLayer(v.marker);
      }
      if (v.polyline) {
        this.map.removeLayer(v.polyline);
      }
    });

    this.cargarVehiculosYPosiciones();

    if (event) {
      setTimeout(() => {
        event.target.complete();
      }, 1000);
    }
  }

  // ==================== BÚSQUEDA ====================

  get vehiculosFiltrados(): VehiculoConPosicion[] {
    if (!this.busqueda.trim()) {
      return this.vehiculosConPosicion;
    }

    const busquedaLower = this.busqueda.toLowerCase();
    return this.vehiculosConPosicion.filter(v =>
      v.vehiculo.placa.toLowerCase().includes(busquedaLower) ||
      v.vehiculo.marca.toLowerCase().includes(busquedaLower) ||
      v.vehiculo.modelo.toLowerCase().includes(busquedaLower)
    );
  }

  get vehiculosConGPS(): number {
    return this.vehiculosConPosicion.filter(v => v.ultimaPosicion !== null).length;
  }

  // ==================== UTILIDADES ====================

  async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'danger' | 'primary' = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
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

  volver() {
    this.navCtrl.navigateBack('/tabs/tab1');
  }
}
