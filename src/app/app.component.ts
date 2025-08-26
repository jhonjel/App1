import { Component } from '@angular/core';

import { IonApp, IonRouterOutlet, IonMenu, IonToolbar, IonHeader, IonTitle, IonList, IonContent, IonItem, IonLabel } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [ IonLabel, IonItem, IonContent, IonList, IonTitle, IonHeader, IonToolbar, IonApp, IonRouterOutlet, IonMenu,],
})
export class AppComponent {
  menuCtrl: any;
  constructor() {}

  openMenu() {
    this.menuCtrl.open().then(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    });
  }


}
