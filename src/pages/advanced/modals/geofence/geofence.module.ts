import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GeofencePage } from './geofence';

@NgModule({
  declarations: [
    GeofencePage,
  ],
  imports: [
    IonicPageModule.forChild(GeofencePage),
  ],  
})
export class GeofencePageModule {}
