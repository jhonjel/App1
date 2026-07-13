
---

````markdown
# 📱 Proyecto Ionic + Angular

## 👥 Integrantes
- Jefer Cuero  
- Potosi Reyes  
- Jennifer Mondragón  
- Jhon Estupiñan  lasso

---
---
Geolocalización en Ionic con @capacitor/geolocation  

Este proyecto busca implementar geolocalización en una aplicación desarrollada con *Ionic Angular, tomando como ejemplo el caso de un **carro de basura* que muestra su ubicación en un mapa.  

La app permite visualizar la *ubicación actual en tiempo real* del vehículo a través de las coordenadas GPS del dispositivo.  

---  

## 📲 Funcionamiento  
- Obtiene las coordenadas (latitud y longitud) del carro de basura.  
- Actualiza la posición en el mapa mientras el vehículo se mueve.  

---  

## ⚙️ Uso principal  
- Mostrar la ubicación puntual del carro de basura.  
- Seguir su recorrido en tiempo real durante la recolección de residuos.  

---  

## 🚀 Estado del proyecto  
Por ahora, la app solo tiene implementada la *geolocalización básica*, que sirve como base inicial.  
En el futuro se podrán añadir funciones como control de rutas, monitoreo de recorridos y optimización del servicio.




````markdown
# 🌍 Geolocalización con Ionic + Leaflet + Capacitor

Este ejemplo muestra cómo integrar **Leaflet** y **@capacitor/geolocation** en una app **Ionic Angular**.  

La aplicación abre un mapa centrado en **Buenaventura (Valle del Cauca, Colombia)** y coloca un **marcador** en la ubicación actual del usuario, mostrando la **precisión en metros**.

---

## ⚙️ Requisitos
Instalar las dependencias necesarias:

```bash
npm install leaflet
npm install --save-dev @types/leaflet
npm install @capacitor/geolocation
````

Copiar los íconos de Leaflet a `src/assets/leaflet/`:

```bash
mkdir -p src/assets/leaflet
cp node_modules/leaflet/dist/images/* src/assets/leaflet/
```

Agregar el estilo de Leaflet en `angular.json`:

```json
"styles": [
  "src/global.scss",
  "src/theme/variables.scss",
  "./node_modules/leaflet/dist/leaflet.css"
]
```

---

## 📌 Código

### `tab1.page.ts`

```ts
import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements AfterViewInit {

  private map!: L.Map;

  constructor() {}

  async ngAfterViewInit() {
    this.initMap();
    await this.loadUserLocation();
  }

  private initMap(): void {
    // Crear el mapa centrado en Buenaventura
    this.map = L.map('map').setView([3.8777, -77.0312], 13);

    // Cargar mapa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Fix para íconos de Leaflet (desde assets)
    const DefaultIcon = L.icon({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });

    L.Marker.prototype.options.icon = DefaultIcon;
  }

  private async loadUserLocation() {
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      const lat = coordinates.coords.latitude;
      const lng = coordinates.coords.longitude;
      const accuracy = coordinates.coords.accuracy;

      // Mover el mapa a la ubicación actual
      this.map.setView([lat, lng], 15);

      // Colocar marcador
      L.marker([lat, lng])
        .addTo(this.map)
        .bindPopup(`📍 Tu ubicación<br>Precisión: ${accuracy} metros`)
        .openPopup();

    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  }
}
```

---

### `tab1.page.html`

```html
<ion-header [translucent]="true">
  <ion-toolbar>
    <ion-title>Mapa - Tab 1</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content [fullscreen]="true">
  <!-- Contenedor para Leaflet -->
  <div id="map"></div>
</ion-content>
```

---

### `tab1.page.scss`

```scss
#map {
  height: 100%;
  width: 100%;
}
```

---

## 🗺️ Resultado esperado

* Se carga un mapa de **OpenStreetMap** en `Tab1`.
* Se obtiene la **ubicación actual** del dispositivo.
* Se coloca un **marcador** en esa posición.
* El marcador muestra un popup con la **precisión en metros**.

---

## 📌 Tecnologías usadas

* [Ionic Angular](https://ionicframework.com/docs/angular/overview)
* [Leaflet](https://leafletjs.com/)
* [Capacitor Geolocation](https://capacitorjs.com/docs/apis/geolocation)
* [OpenStreetMap](https://www.openstreetmap.org/)

---

```







