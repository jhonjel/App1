import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { Loaddata } from '../services/loaddata';
import { inject } from '@angular/core';
import { environment } from 'src/environments/environment';



@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonMenuButton]
})
export class Tab2Page {
  myservice= inject(Loaddata);


  constructor() {

    this.cargarData();


  }

  public async cargarData(){

    let data= await this.myservice.cargarDatos('vehiculos?perfil_id='+environment.tokenSecret);
    console.log("vehiculos",data);
  }
}

