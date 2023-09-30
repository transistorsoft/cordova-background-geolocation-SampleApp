import { Router} from '@angular/router';

const LocalStorage = (<any>window).localStorage;

import BackgroundGeolocation, {
  HttpEvent,
  TransistorAuthorizationToken,
  Subscription
} from "../cordova-background-geolocation";

import {environment} from "../../environments/environment";

/// Keep a reference to onHttp subscription.
let onHttpSubscription:Subscription;

export async function registerTransistor():Promise<TransistorAuthorizationToken> {
  LocalStorage.getItem('orgname');
  LocalStorage.getItem('username');
  const orgname = null;
  const username = null;

  if (orgname == null || username == null) {
  	//this.navCtrl.setRoot('HomePage');
  	return {
      accessToken: "DUMMY_TOKEN",
      refreshToken: "DUMMY_TOKEN",
      expires: -1,
      url: ''
    };
  }
  const token:TransistorAuthorizationToken = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(orgname, username, environment.TRACKER_HOST);

  await BackgroundGeolocation.setConfig({
    transistorAuthorizationToken: token
  });
  return token;
}

export async function registerTransistorAuthorizationListener(router:Router) {
	if (onHttpSubscription) {
		onHttpSubscription.remove();
  }

	onHttpSubscription = BackgroundGeolocation.onHttp(async (event:HttpEvent) =>{
    console.log('[Authorization onHttp]');
    switch(event.status) {
      case 403:
      case 406:
        await BackgroundGeolocation.destroyTransistorAuthorizationToken(environment.TRACKER_HOST);
        const token = await registerTransistor();
        if (token.accessToken !== 'DUMMY_TOKEN') {
          await BackgroundGeolocation.setConfig({
            transistorAuthorizationToken: token
          });
          BackgroundGeolocation.sync();
        }
        break;
      case 410:
        LocalStorage.removeItem('username');
        router.navigate(['/home']);
        break;
    }
  });
}