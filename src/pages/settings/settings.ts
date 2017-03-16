import { Component, NgZone } from '@angular/core';
import {
  AlertController,
  ModalController,
  ViewController,
  LoadingController
} from "ionic-angular";

import {BGService} from '../../lib/BGService';
import {AboutPage} from '../about/about';

const TRACKING_MODE_OPTIONS = [
  'location',
  'geofence'
];
const LOG_LEVEL_OPTIONS = ['OFF', 'ERROR', 'WARNING', 'INFO', 'DEBUG', 'VERBOSE'];

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})

export class SettingsPage {
  storage: any;
  alert: any;
  state: any;
  basicTab: any;
  listTab: any;
  selectedSegment: string;
  trackingModeOptions: any;
  desiredAccuracyOptions: any;
  distanceFilterOptions: any;
  autoSyncThresholdOptions: any;
  geofenceProximityRadiusOptions: any;
  heartbeatIntervalOptions: any;
  logLevelOptions: any;
  logMaxDaysOptions: any;
  geofenceOptions: any;

  email: string;
  isSyncing: boolean;
  isEmailingLog: boolean;
  isAddingGeofences: boolean;
  isResettingOdometer: boolean;

  constructor(
    private bgService: BGService,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private zone: NgZone) {

    // We do a BackgroundGeolocation#getState each time Settings screen is shown.
    this.trackingModeOptions = TRACKING_MODE_OPTIONS;
    this.logLevelOptions = LOG_LEVEL_OPTIONS;

    this.geofenceOptions = {
      notifyOnEntry: true,
      notifyOnExit: false,
      notifyOnDwell: false,
      loiteringDelay: 0,
      radius: 200,
      extras: {
        geofence_extra_foo: 'bar'
      }
    };

    this.isSyncing = false;
    this.isAddingGeofences = false;
    this.isResettingOdometer = false;

    this.state = {
      // Geolocation
      trackingMode: 'location',
      desiredAccuracy: 0,
      distanceFilter: 0,
      disableElasticity: false,
      geofenceProximityRadius: 1000,
      // Activity Recognition
      activityRecognitionInterval: 10000,
      stopTimeout: 5,
      stopDetectionDelay: 0,
      disableStopDetection: false,
      // HTTP & Persistence
      url: '',
      autoSync: false,
      autoSyncThreshold: 0,
      batchSync: false,
      method: 'POST',
      // Application
      stopOnTerminate: true,
      startOnBoot: false,
      foregroundService: false,
      preventSuspend: false,
      heartbeatInterval: 60,
      // Logging & Debug
      logLevel: 'VERBOSE',
      logMaxDays: 7,
      debug: true
    }

    let loader = this.loadingCtrl.create({
      content: "Loading..."
    });
    // Weirdness with LoadingController now showing because SettingsPage lives in a Modal.  Oh well...
    setTimeout(() => {
      loader.present();
    });

    this.bgService.getState((state) => {
      // Geolocation
      this.state.trackingMode = (state.trackingMode === 1 || state.trackingMode === 'location') ? 'location' : 'geofence';
      this.state.desiredAccuracy = state.desiredAccuracy;
      this.state.distanceFilter = state.distanceFilter;
      this.state.disableElasticity = state.disableElasticity;
      this.state.geofenceProximityRadius = state.geofenceProximityRadius;
      // Activity Recognition
      this.state.activityRecognitionInterval = state.activityRecognitionInterval;
      this.state.stopTimeout = state.stopTimeout;
      this.state.stopDetectionDelay = state.stopDetectionDelay;
      this.state.disableStopDetection = state.disableStopDetection;
      // HTTP & Persistence
      this.state.url = state.url;
      this.state.autoSync = state.autoSync;
      this.state.autoSyncThreshold = state.autoSyncThreshold;
      this.state.batchSync = state.batchSync;
      this.state.method = state.method;
      // Application
      this.state.stopOnTerminate = state.stopOnTerminate;
      this.state.startOnBoot = state.startOnBoot;
      this.state.foregroundService = state.foregroundService;
      this.state.preventSuspend = state.preventSuspend;
      this.state.heartbeatInterval = state.heartbeatInterval;
      // Logging & Debug
      this.state.logLevel = this._decodeLogLevel(state.logLevel);
      this.state.logMaxDays = state.logMaxDays;
      this.state.debug = state.debug;
      // Hide the Loading...
      loader.dismiss();
    });
  }

  ionViewDidLoad() {
    // Load email address for email log
    let storage = (<any>window).localStorage;
    var email = storage.getItem('settings:email');
    if (email) {
      this.email = email;
    }
  }

  onClickClose() {
    this.bgService.playSound("CLOSE");
    this.viewCtrl.dismiss();
  }
  onClickAbout() {
    this.modalCtrl.create(AboutPage).present();
  }

  onChangeValue(name) {
    var value = this.state[name];
    if (typeof(value) !== 'undefined') {
      switch (name) {
        case 'logLevel':
          value = this._translateLogLevel(value);
          break;
        case 'trackingMode':
          this.setTrackingMode(value);
          break;
        case 'geofenceProximityRadius':
          this.bgService.playSound('ADD_GEOFENCE');
          break;
      }
      this.bgService.set(name, value);
    }
  }

  setTrackingMode(mode) {
    this.bgService.start(mode);
  }

  onClickResetOdometer() {
    this.bgService.playSound('BUTTON_CLICK');
    var bgGeo = this.bgService.getPlugin();
    this.isResettingOdometer = true;

    function onComplete() {
      this.zone.run(() => { this.isResettingOdometer = false;});
    }
    bgGeo.resetOdometer((location) => {
      onComplete.call(this);
    }, (error) => {
      onComplete.call(this);
      this.notify('Reset odometer error', error);
    });
  }

  onUpdateUrl() {
    this.onChangeValue('url');
  }

  onClickSync() {
    this.bgService.playSound('BUTTON_CLICK');
    this.isSyncing = true;

    var bgGeo = this.bgService.getPlugin();

    function onComplete() {
      this.zone.run(() => { this.isSyncing = false; });
    };

    bgGeo.sync((rs, taskId) => {
      this.bgService.playSound('MESSAGE_SENT');
      onComplete.call(this);
      bgGeo.finish(taskId);
    }, (error) => {
      onComplete.call(this);
      this.bgService.playSound('ERROR');
      this.notify('Sync error', error);
    });
  }

  onUpdateEmail() {
    this.bgService.playSound('BUTTON_CLICK');
    let storage = (<any>window).localStorage;
    storage.setItem('settings:email', this.email);
  }

  onClickEmailLogs() {
    this.bgService.playSound('BUTTON_CLICK');

    if (!this.email) {
      this.notify('Email logs', 'Please enter an email address');
      return;
    }

    this.isEmailingLog = true;

    function onComplete() {
      this.zone.run(() => { this.isEmailingLog = false; });
    }

    this.bgService.getPlugin().emailLog(this.email, () => {
      onComplete.call(this);
    }, (error) => {
      onComplete.call(this);
      this.notify('Email error', error);
    });
  }

  onClickRemoveGeofences() {
    this.bgService.playSound('BUTTON_CLICK');

    this.bgService.getPlugin().removeGeofences(() => {
      this.bgService.playSound('MESSAGE_SENT');
    }, (error) => {
      this.bgService.playSound('ERROR');
      this.notify('Remove geofences error', error);
    });
  }

  onClickLoadGeofences() {
    this.bgService.playSound('BUTTON_CLICK');
    this.isAddingGeofences = true;

    var bgGeo     = this.bgService.getPlugin();
    var data      = this.bgService.getCityDriveData();
    var geofences = [], latlng;

    for (var n=0,len=data.length;n<len;n++) {
      latlng = data[n];
      geofences.push({
        identifier: 'city_drive_' + (n+1),
        latitude: parseFloat(latlng.lat),
        longitude: parseFloat(latlng.lng),
        radius: this.geofenceOptions.radius,
        notifyOnEntry: this.geofenceOptions.notifyOnEntry,
        notifyOnExit: this.geofenceOptions.notifyOnExit,
        notifyOnDwell: this.geofenceOptions.notifyOnDwell,
        loiteringDelay: this.geofenceOptions.loiteringDelay,
        extras: this.geofenceOptions.extras
      });
    }

    function onComplete() {
      this.zone.run(() => { this.isAddingGeofences = false; })
    };

    bgGeo.addGeofences(geofences, () => {
      onComplete.call(this);
      this.bgService.playSound('ADD_GEOFENCE');
    }, (error) => {
      onComplete.call(this);
      this.bgService.playSound('ERROR');
      this.notify('Add geofences error', error);
    });
  }

  notify(title, message) {
    this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['Dismiss']
    }).present();
  }

  _decodeLogLevel(value) {
    switch(value) {
      case 0:
        value = 'OFF';
        break;
      case 1:
        value = 'ERROR';
        break;
      case 2:
        value = 'WARNING';
        break;
      case 3:
        value = 'INFO';
        break;
      case 4:
        value = 'DEBUG';
        break;
      case 5:
        value = 'VERBOSE';
        break;
    }
    return value;
  }
  _translateLogLevel(value) {
    switch(value) {
      case 'OFF':
        value = 0;
        break;
      case 'ERROR':
        value = 1;
        break;
      case 'WARNING':
        value = 2;
        break;
      case 'INFO':
        value = 3;
        break;
      case 'DEBUG':
        value = 4;
        break;
      case 'VERBOSE':
        value = 5;
    }
    return value;
  }

}
