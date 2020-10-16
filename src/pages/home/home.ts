import { Component, NgZone } from '@angular/core';
import {
  IonicPage,
  NavController,
  AlertController,
  NavParams,
  Platform,
  ModalController
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
    private modalController: ModalController,
    private alertCtrl: AlertController
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
      // NOTE:  showing modal immediately on boot causes problem with focussing fields on
      // registration modal.
      //this.onClickRegister();
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
    if (this.willDiscloseBackgroundPermission(value)) {
      return;
    }

    // Persist the selected page.
    localStorage.setItem('page', value);
    this.navCtrl.setRoot(value);
  }

  async onClickRegister() {
    let modal = this.modalController.create('RegistrationPage', {
      orgname: this.orgname,
      username: this.username
    });
    modal.onDidDismiss(async (result) => {
      // Update our view-state -- BackgroundGeolocation state may have changed in Settings screen.
      if (result != null) {
        this.orgname = result.orgname;
        this.username = result.username;
        this.deviceIdentifier = this.deviceInfo.model + '-' + this.username;
      }
    });

    modal.present();
  }

  private isValid(name) {
    if (!name || (name.length == 0)) return false;
    name = name.replace(/s+/, '');
    return USERNAME_VALIDATOR.test(name);
  }

  private willDiscloseBackgroundPermission(routeName):boolean {
    let localStorage = (<any>window).localStorage;
    let hasDisclosedBackgroundPermission = (localStorage.getItem('hasDisclosedBackgroundPermission') !== null);

    if (!hasDisclosedBackgroundPermission) {
      let alert = this.alertCtrl.create({
        title: 'Background Location Access',
        message: 'BG Geo collects location data to enable tracking your trips to work and calculate distance travelled even when the app is closed or not in use.\n\nThis data will be uploaded to tracker.transistorsoft.com where you may view and/or delete your location history.',
        buttons: [{
          text: 'Close'
        }]
      });
      alert.onDidDismiss(() => {
        localStorage.setItem('hasDisclosedBackgroundPermission', true);
        this.onClickNavigate(routeName);
      });
      alert.present();
    }
    return !hasDisclosedBackgroundPermission;
  }
}
