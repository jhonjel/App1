import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonButton, } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [ IonButton, IonLabel, IonItem, IonAccordion, IonAccordionGroup, IonButtons, IonHeader, IonToolbar, IonTitle, IonContent, ExploreContainerComponent, IonMenuButton, RouterModule],
})
export class Tab3Page {
  constructor() {}
}
