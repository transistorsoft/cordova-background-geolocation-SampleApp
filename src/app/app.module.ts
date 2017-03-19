import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SettingsPage} from '../pages/settings/settings';
import { GeofencePage} from '../pages/geofence/geofence';
import { AboutPage} from '../pages/about/about';
import { BGService} from '../lib/BGService';
import { SettingsService} from '../lib/SettingsService';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SettingsPage,
    GeofencePage,
    AboutPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SettingsPage,
    GeofencePage,
    AboutPage
  ],
  providers: [{provide: ErrorHandler, useClass: IonicErrorHandler}, BGService, SettingsService]
})
export class AppModule {}
