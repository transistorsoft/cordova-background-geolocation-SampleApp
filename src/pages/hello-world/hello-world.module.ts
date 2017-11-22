import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HelloWorldPage } from './hello-world';

@NgModule({
  declarations: [
    HelloWorldPage,
  ],
  imports: [
    IonicPageModule.forChild(HelloWorldPage),
  ],
})
export class HelloWorldPageModule {}
