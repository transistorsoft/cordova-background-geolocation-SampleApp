import { Component, ViewChild } from '@angular/core';
import { Platform, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import {registerTransistorAuthorizationListener} from "../lib/authorization";

// Determine initial Root page (ie: which app to launch -- HelloWorld, AdvancedApp, SimpleMap or Home)
let localStorage = (<any>window).localStorage;
let orgname = localStorage.getItem('orgname');
let username = localStorage.getItem('username');
let isRegistered = (orgname && username);
let root = (isRegistered) ? localStorage.getItem('page') : 'HomePage'

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild('rootNav') nav: NavController
  rootPage:string = root || 'HomePage';

  platform: Platform;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    this.platform = platform;

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();

      // Dark statusbar for Android
      if (platform.is('android')) {
        statusBar.overlaysWebView(false);
        statusBar.backgroundColorByHexString('#272727');
      }
      splashScreen.hide();
    });
  }

  // Wait for the components in MyApp's template to be initialized
  // In this case, we are waiting for the Nav with reference variable of "#myNav"
  ngOnInit() {
    this.platform.ready().then(() => {
      // Handle authorization failures from tracker.transistorsoft.com Demo server.
      registerTransistorAuthorizationListener(this.nav);
    });
  }
}

