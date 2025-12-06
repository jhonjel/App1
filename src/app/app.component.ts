import { Component, OnInit } from '@angular/core';
import {
  IonApp, IonRouterOutlet, IonMenu, IonToolbar, IonHeader,
  IonTitle, IonList, IonContent, IonItem, IonLabel, IonIcon
} from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    IonIcon, IonLabel, IonItem, IonContent, IonList, IonTitle,
    IonHeader, IonToolbar, IonApp, IonRouterOutlet, IonMenu
  ],
})
export class AppComponent implements OnInit {
  menuCtrl: any;
  esVisitante = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a cambios en el usuario
    this.authService.usuarioObservable.subscribe(user => {
      if (user) {
        const rol = this.authService.getRole();
        this.esVisitante = rol === 'visitante';
        console.log('👤 Usuario autenticado, rol:', rol);
      } else {
        this.esVisitante = false;
      }
    });
  }

  openMenu() {
    // Solo abrir menú si NO es visitante
    if (!this.esVisitante && this.menuCtrl) {
      this.menuCtrl.open().then(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    }
  }
}
