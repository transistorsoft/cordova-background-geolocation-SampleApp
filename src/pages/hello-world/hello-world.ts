import { Component,  NgZone  } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { Device } from '@ionic-native/device';


// Url to post locations to
const TRACKER_HOST = 'http://tracker.transistorsoft.com/locations/';

@IonicPage()
@Component({
  selector: 'page-hello-world',
  templateUrl: 'hello-world.html',
})
export class HelloWorldPage {
  // BackgroundGeolocation instance
  bgGeo: any;

  // UI State
  enabled: boolean;
  isMoving: boolean;

  // ion-list datasource
  events: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private device: Device, private platform: Platform, private zone:NgZone) {
    this.isMoving = false;
    this.enabled = false;
    this.events = [];

    // Listen for deviceready to configure BackgroundGeolocation
    this.platform.ready().then(this.onDeviceReady.bind(this));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HelloWorldPage');
  }

  onDeviceReady() {
    // Compose #url: tracker.transistorsoft.com/locations/{username}
    let localStorage = (<any>window).localStorage;
    let username = localStorage.getItem('username');
    let url = TRACKER_HOST + username;

    // Get reference to BackgroundGeolocation API
    this.bgGeo = (<any>window).BackgroundGeolocation;

    // Step 1:  Listen to events
    this.bgGeo.on('location', this.onLocation.bind(this));
    this.bgGeo.on('motionchange', this.onMotionChange.bind(this));
    this.bgGeo.on('activitychange', this.onActivityChange.bind(this));
    this.bgGeo.on('http', this.onHttpSuccess.bind(this), this.onHttpFailure.bind(this));
    this.bgGeo.on('providerchange', this.onProviderChange.bind(this));
    this.bgGeo.on('powersavechange', this.onPowerSaveChange.bind(this));

    // Step 2:  Configure the plugin
    this.bgGeo.configure({
      debug: true,
      logLevel: this.bgGeo.LOG_LEVEL_VERBOSE,
      distanceFilter: 10,
      stopTimeout: 1,
      stopOnTerminate: false,
      startOnBoot: true,
      foregroundService: true,
      url: url,
      autoSync: true,
      params: {
        device: {  // <-- required for tracker.transistorsoft.com
          platform: this.device.platform,
          version: this.device.version,
          uuid: this.device.uuid,
          cordova: this.device.cordova,
          model: this.device.model,
          manufacturer: this.device.manufacturer,
          framework: 'Cordova'
        }
      }
    }, (state) => {
      console.log('- Configure success: ', state);
      // Update UI state (toggle switch, changePace button)
      this.zone.run(() => {
        this.isMoving = state.isMoving;
        this.enabled = state.enabled;
      });
    });
  }

  // Return to Home screen (app switcher)
  onClickHome() {
    this.navCtrl.setRoot('HomePage');
  }

  // #start / #stop tracking
  onToggleEnabled() {
    if (this.enabled) {
      this.bgGeo.start();
    } else {
      this.bgGeo.stop();
    }
  }

  // Fetch the current position
  onClickGetCurrentPosition() {
    this.bgGeo.getCurrentPosition((location) => {
      console.log('- getCurrentPosition: ', location);
    }, (error) => {
      console.warn('- Location error: ', error);
    });
  }

  // Change plugin state between stationary / tracking
  onClickChangePace() {
    this.isMoving = !this.isMoving;
    this.bgGeo.changePace(this.isMoving);
  }

  // Clear the list of events from ion-list
  onClickClear() {
    this.events = [];
  }

  /**
  * @event location
  */
  onLocation(location) {
    console.log('[event] location: ', location);
    let event = location.event || 'location';

    this.zone.run(() => {
      this.addEvent(event, new Date(location.timestamp), location);
    })
  }
  /**
  * @event motionchange
  */
  onMotionChange(isMoving, location) {
    console.log('[event] motionchange, isMoving: ', isMoving, ', location: ', location);
    this.zone.run(() => {
      this.isMoving = isMoving;
    });
  }
  /**
  * @event activitychange
  */
  onActivityChange(event) {
    console.log('[event] activitychange: ', event);
    this.zone.run(() => {
      this.addEvent('activitychange', new Date(), event);
    });
  }
  /**
  * @event http
  */
  onHttpSuccess(response) {
    console.log('[event] http: ', response);
    this.zone.run(() => {
      this.addEvent('http', new Date(), response);
    });
  }
  onHttpFailure(response) {
    console.warn('[event] http failure: ', response);
    this.zone.run(() => {
      this.addEvent('http failure', new Date(), response);
    });
  }
  /**
  * @event providerchange
  */
  onProviderChange(provider) {
    console.log('[event] providerchange', provider);
    this.zone.run(() => {
      this.addEvent('providerchange', new Date(), provider);
    });
  }
  /**
  * @event powersavechange
  */
  onPowerSaveChange(isPowerSaveEnabled) {
    console.log('[event] powersavechange', isPowerSaveEnabled);
    this.zone.run(() => {
      this.addEvent('powersavechange', new Date(), {isPowerSaveEnabled: isPowerSaveEnabled});
    });
  }

  /**
  * Add a record to ion-list
  * @param {String} event name
  * @param {Date} date
  * @param {Object} event object, eg: {location}, {provider}, {activity}
  */
  private addEvent(name, date, event) {
    let timestamp = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

    this.events.unshift({
      name: name,
      timestamp: timestamp,
      object: event,
      content: JSON.stringify(event, null, 2)
    });
  }
}
