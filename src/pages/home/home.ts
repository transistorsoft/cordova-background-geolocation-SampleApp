import { Component, NgZone } from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams,
  Platform,
  AlertController,
  ToastController
} from 'ionic-angular';

////
// NOTE:  normally you will simply import from "cordova-background-geolocation-lt" or "cordova-background-geolocation"
// from "../../cordova-background-geolocation" is only fro convenience in the SampleApp for easily switching
// between public / private version of the plugin
//
import BackgroundGeolocation, {DeviceInfo} from "../../cordova-background-geolocation";

import ENV from "../../ENV";

import {registerTransistorAuthorizationListener} from "../../lib/authorization";

// Only allow alpha-numeric usernames with '-' and '_'
const USERNAME_VALIDATOR =  /^[a-zA-Z0-9_-]*$/;

/**
 * The HomePage will prompt you for a username so the plugin can post locations to tracker.transistorsoft.com/locations/{username}
 *
 * You can view your tracking in our web app in your browser at http://tracking.transistorsoft.com/{username}
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  orgname: string;
  username: string;
  deviceIdentifier: string;
  deviceInfo: DeviceInfo;
  url: string;

  constructor(
    public zone: NgZone,
    public navCtrl: NavController,
    public navParams: NavParams,
    private platform: Platform,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.platform.ready().then(this.onDeviceReady.bind(this));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    let localStorage = (<any>window).localStorage;
    localStorage.removeItem('page');
  }

  onDeviceReady() {
    BackgroundGeolocation.stop();
    BackgroundGeolocation.removeListeners().then(() => {
      registerTransistorAuthorizationListener(this.navCtrl);
    });

    let localStorage = (<any>window).localStorage;

    this.orgname = localStorage.getItem('orgname');
    this.username = localStorage.getItem('username');

    // Handle install of previous version, where orgname didn't exist and reverse the values, placing username into orgname.
    if (this.isValid(this.username) && this.orgname == null) {
      localStorage.setItem('orgname', this.username);
      localStorage.removeItem('username');
      this.orgname = this.username;
      this.username = null;
    }

    this.url = ENV.TRACKER_HOST;
    if (this.isValid(this.orgname)) {
      this.url += '/' + this.orgname;
    }
    BackgroundGeolocation.getDeviceInfo().then((deviceInfo:DeviceInfo) => {
      this.deviceInfo = deviceInfo;
      let identifier = deviceInfo.model;
      if (this.username) {
        identifier += '-' + this.username;
      }
      this.deviceIdentifier = identifier;
    });

    if (!this.isValid(this.orgname) || !this.isValid(this.username)) {
      this.onClickRegister();
    }
  }

  async onClickNavigate(value) {
    let localStorage = (<any>window).localStorage;
    let orgname = localStorage.getItem('orgname');
    let username = localStorage.getItem('username');
    // Sanity check.
    if (!this.isValid(orgname) || !this.isValid(username)) {
      return this.onClickRegister();
    }
    // Persist the selected page.
    localStorage.setItem('page', value);
    this.navCtrl.setRoot(value);
  }

  async onClickRegister() {
    let deviceInfo = await BackgroundGeolocation.getDeviceInfo();

    this.alertController.create({
      enableBackdropDismiss: false,
      title: 'Device Registration',
      subTitle: 'Please provide an Organization and User identifier',
      cssClass: 'registration ' + this.deviceInfo.platform,
      message: deviceInfo.manufacturer + ' ' + deviceInfo.model,
      inputs: [{
        name: 'orgname',
        value: this.orgname,
        placeholder: 'Organization or Company name',
        type: 'email'
      },{
        name: 'username',
        value: this.username,
        placeholder: 'Username or initials',
        type: 'email'
      }],
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: data => {
          console.log('Cancel clicked');
        }
      }, {
        text: 'Register',
        handler: this.onClickSave.bind(this)
      }]
    }).present();
  }

  async onClickSave(data) {
    let orgname = data.orgname;
    let username = data.username;
    let errors = [];
    if (!this.isValid(orgname)) errors.push('Organization name');
    if (!this.isValid(username)) errors.push('Username');

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
    this.url = ENV.TRACKER_HOST + '/' + orgname;

    // Destroy existing cached token.
    await BackgroundGeolocation.destroyTransistorAuthorizationToken(ENV.TRACKER_HOST);
    // Register device with tracker.transistorsoft.com to receive a JSON Web Token (JWT).
    let token = await BackgroundGeolocation.findOrCreateTransistorAuthorizationToken(orgname, username,ENV.TRACKER_HOST);

    await BackgroundGeolocation.setConfig({
      transistorAuthorizationToken: token
    });

    let localStorage = (<any>window).localStorage;

    this.orgname = orgname;
    this.username = username;
    localStorage.setItem('orgname', orgname);
    localStorage.setItem('username', username);

    let deviceInfo = await BackgroundGeolocation.getDeviceInfo();
    this.deviceIdentifier = deviceInfo.model + '-' + username;

    return true;
  }

  private isValid(name) {
    if (!name || (name.length == 0)) return false;
    name = name.replace(/s+/, '');
    return USERNAME_VALIDATOR.test(name);
  }
}
