import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRange,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { personCircle, personCircleOutline, sunny, sunnyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-example',
  templateUrl: 'dark.page.html',
  styleUrls: ['dark.page.scss'],
  imports: [
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonRange,
    IonText,
    IonTitle,
    IonToggle,
    IonToolbar,
    RouterModule
  ],
})
export class DarkPage {
  constructor() {
    /**
     * Any icons you want to use in your application
     * can be registered in app.component.ts and then
     * referenced by name anywhere in your application.
     */
    addIcons({ personCircle, personCircleOutline, sunny, sunnyOutline });
  }
}
