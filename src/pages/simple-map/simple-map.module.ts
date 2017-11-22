import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SimpleMapPage } from './simple-map';

@NgModule({
  declarations: [
    SimpleMapPage,
  ],
  imports: [
    IonicPageModule.forChild(SimpleMapPage),
  ],
})
export class SimpleMapPageModule {}
