import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Loaddata } from '../services/loaddata';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonMenuButton],
})
export class Tab3Page {
  public info: any = {
    "nombre_ruta": "ruta jefer",
    "calles" : ["813c43d9-5306-4ece-a1a6-2514024d7559"],
    "perfil_id": "febeed33-ed10-4126-b4c7-73756db1f368"

  }
 myservice= inject(Loaddata);
  constructor() {
    this.myservice.guardarDatos('rutas',this.info);
  }
}
