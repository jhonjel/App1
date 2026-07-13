import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';


import { 
  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonMenuButton 
} from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonMenuButton
  ],
})
export class Tab1Page implements AfterViewInit {
  private map!: L.Map;

  constructor() {}

  async ngAfterViewInit() {
    // Coordenadas de Buenaventura (por defecto)
    const buenaventuraCoords: L.LatLngExpression = [3.8801, -77.0312];

    // Inicializar mapa
    this.map = L.map('map').setView(buenaventuraCoords, 13);

    // Agregar capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    try {
      // Obtener ubicación actual
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true
      });

      const userCoords: L.LatLngExpression = [
        position.coords.latitude,
        position.coords.longitude,
      ];

      // Agregar marcador en la posición actual
      L.marker(userCoords).addTo(this.map)
        .bindPopup('📍 Estás aquí')
        .openPopup();

      // Centrar el mapa en la ubicación actual
      this.map.setView(userCoords, 14);

    } catch (err) {
      console.error('Error al obtener ubicación:', err);
      // Si falla, se queda en Buenaventura
      this.map.setView(buenaventuraCoords, 13);
    }
  }
}
