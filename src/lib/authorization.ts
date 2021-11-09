import {NavController} from "ionic-angular"

import BackgroundGeolocation, {
  Subscription,
  HttpEvent,
  TransistorAuthorizationToken
} from "../cordova-background-geolocation";

import ENV from "../ENV";

let onHttpSubscription:Subscription;

export async function registerTransistor():Promise<TransistorAuthorizationToken> {
  let localStorage = (<any>window).localStorage;
  let orgname = localStorage.getItem('orgname');
  let username = localStorage.getItem('username');
  if (orgname == null || username == null) {
  	this.navCtrl.setRoot('HomePage');
  	return {
      accessToken: "DUMMY_TOKEN",
      refreshToken: "DUMMY_TOKEN",
      expires: -1,
      url: ''
    };
  }
  const token:TransistorAuthorizationToken = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(orgname, username, ENV.TRACKER_HOST);

  await BackgroundGeolocation.setConfig({
    transistorAuthorizationToken: token
  });
  return token;
}

export async function registerTransistorAuthorizationListener(navCtrl:NavController) {
  console.log('[registerTransistorAuthorizationListener]');

	if (onHttpSubscription) {
		onHttpSubscription.remove();
  }
  onHttpSubscription = BackgroundGeolocation.onHttp(async (event:HttpEvent) => {
    switch(event.status) {
      case 403:
      case 406:
        await BackgroundGeolocation.destroyTransistorAuthorizationToken(ENV.TRACKER_HOST);
        let token = await registerTransistor();
        if (token.accessToken !== 'DUMMY_TOKEN') {
          await BackgroundGeolocation.setConfig({
            transistorAuthorizationToken: token
          });
          BackgroundGeolocation.sync();
        }
        break;
      case 410:
        let localStorage = (<any>window).localStorage;
        localStorage.removeItem('username');
        navCtrl.setRoot('HomePage')
        break;
    }
  });
}