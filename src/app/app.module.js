var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, ErrorHandler } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SettingsPage } from '../pages/settings/settings';
import { GeofencePage } from '../pages/geofence/geofence';
import { AboutPage } from '../pages/about/about';
import { BGService } from '../lib/BGService';
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    NgModule({
        declarations: [
            MyApp,
            HomePage,
            SettingsPage,
            GeofencePage,
            AboutPage
        ],
        imports: [
            IonicModule.forRoot(MyApp),
            IonicStorageModule.forRoot()
        ],
        bootstrap: [IonicApp],
        entryComponents: [
            MyApp,
            HomePage,
            SettingsPage,
            GeofencePage,
            AboutPage
        ],
        providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler }, Storage, BGService]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map