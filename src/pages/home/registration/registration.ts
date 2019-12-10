import { Component } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ViewController,
	ToastController,
	Platform
} from 'ionic-angular';

import BackgroundGeolocation from "../../../cordova-background-geolocation";

import ENV from "../../../ENV";

// Only allow alpha-numeric usernames with '-' and '_'
const USERNAME_VALIDATOR =  /^[a-zA-Z0-9_-]*$/;

/**
 * Generated class for theRegistrationPage page.
 */
@IonicPage()
@Component({
  selector: 'page-registration',
  templateUrl: 'registration.html',
})
export class RegistrationPage {

	orgname: string;
	username: string;
	url: string;
	devicename: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewController: ViewController, public platform: Platform, private toastController: ToastController) {
  	this.orgname = this.navParams.get('orgname');
  	this.username = this.navParams.get('username');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegistrationPage');
    this.platform.ready().then(this.onReady.bind(this));
  }

  async onReady() {
  	let deviceInfo = await BackgroundGeolocation.getDeviceInfo();
  	this.devicename = deviceInfo.manufacturer + ' ' + deviceInfo.model;

  	this.url = ENV.TRACKER_HOST;

  }

  onClickCancel() {
  	this.viewController.dismiss(null);
  }

  async onClickRegister() {
  	let errors = [];
    if (!this.isValid(this.orgname)) errors.push('Organization name');
    if (!this.isValid(this.username)) errors.push('Username');

    if (errors.length > 0) {
      let msg = "Invalid " + errors.join(', ');
      this.toastController.create({
        message: msg,
        duration: 3000,
        cssClass: 'toast-error',
        position: 'top'

      }).present();

      return false;
    }
    // Destroy existing cached token.
    await BackgroundGeolocation.destroyTransistorAuthorizationToken(ENV.TRACKER_HOST);
    // Register device with tracker.transistorsoft.com to receive a JSON Web Token (JWT).
    let token = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(this.orgname, this.username, ENV.TRACKER_HOST);

    await BackgroundGeolocation.setConfig({
      transistorAuthorizationToken: token
    });

    let localStorage = (<any>window).localStorage;

    localStorage.setItem('orgname', this.orgname);
    localStorage.setItem('username', this.username);

    this.viewController.dismiss({
    	orgname: this.orgname,
    	username: this.username
    });
  }

  private isValid(name) {
    if (!name || (name.length == 0)) return false;
    name = name.replace(/s+/, '');
    return USERNAME_VALIDATOR.test(name);
  }

}
