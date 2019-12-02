import {NavController} from "ionic-angular"

import BackgroundGeolocation, {
  HttpEvent,
  TransistorAuthorizationToken
} from "../cordova-background-geolocation";

import ENV from "../ENV";

let onHttp:any;

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
  let token:TransistorAuthorizationToken = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(orgname, username, ENV.TRACKER_HOST);

  await BackgroundGeolocation.setConfig({
    transistorAuthorizationToken: token
  });
  return token;
}

export async function registerTransistorAuthorizationListener(navCtrl:NavController) {
  console.log('[registerTransistorAuthorizationListener]');

	if (typeof(onHttp) === 'function') {
		await BackgroundGeolocation.removeListener('http', onHttp);
  }
  onHttp = async function onHttp(event:HttpEvent) {
    switch(event.status) {
      case 406:
        let token = await registerTransistor();
        if (token.accessToken !== 'DUMMY_TOKEN') {
          BackgroundGeolocation.sync();
        }
        break;
      case 410:
        let localStorage = (<any>window).localStorage;
        localStorage.removeItem('username');
        navCtrl.setRoot('HomePage')
        break;
    }
  };

	BackgroundGeolocation.onHttp(onHttp);
}