import {
  Events,
  AlertController,
  ToastController
} from 'ionic-angular';
import {Injectable} from "@angular/core";

const APP_SETTINGS = [

  {name: 'geofenceRadius', defaultValue: 200},
  {name: 'geofenceNotifyOnEntry', defaultValue: true},
  {name: 'geofenceNotifyOnExit', defaultValue: false},
  {name: 'geofenceNotifyOnDwell', defaultValue: false},
  {name: 'geofenceLoiteringDelay', defaultValue: 30000},
  {name: 'mapHideMarkers', defaultValue: false},
  {name: 'mapHidePolyline', defaultValue: false},
  {name: 'mapHideGeofenceHits', defaultValue: false},
  {name: 'email', defaultValue: null}
];

const GEOFENCE_RADIUS_OPTIONS = [50, 100, 150, 200, 500, 1000];
const GEOFENCE_LOITERING_DELAY_OPTIONS = [1*1000, 10*1000, 30*1000, 60*1000, 5*60*1000];

////
// Normally once wouldn't include the plugin like this.  It's done to allow me to
// easily switch between importing the npm vs paid version by editing a single file.
//
import BackgroundGeolocation from "../../../cordova-background-geolocation";

@Injectable()

export class SettingsService {

  public applicationState:any;
  private myState:any;
  private storage:any;
  public geofenceRadiusOptions: any;
  public geofenceLoiteringDelayOptions: any;

  constructor(
    private events:Events,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {
    this.storage = (<any>window).localStorage;

    this.geofenceRadiusOptions = GEOFENCE_RADIUS_OPTIONS;
    this.geofenceLoiteringDelayOptions = GEOFENCE_LOITERING_DELAY_OPTIONS;

    this.applicationState = {};
    if (this.storage.hasOwnProperty('settings')) {
      this.loadState();
    } else {
      APP_SETTINGS.forEach((setting) => {
        this.applicationState[setting.name] = setting.defaultValue;
      });
      this.saveState();
    }
  }

  getApplicationState() {
    return this.applicationState;
  }

  onChange(name) {
    if (this.myState[name] === this.applicationState[name]) {
      return;
    }
    this.saveState();
    this.events.publish('change', name, this.applicationState[name]);
  }

  set(name, value) {
    if (!this.applicationState.hasOwnProperty(name)) {
      console.warn("SettingsService#set: Unknown property ", name);
      return;
    }
    if (this.myState[name] === value) {
      return;
    }
    this.applicationState[name] = value;
    this.saveState();
    this.events.publish('change', name, value);
  }

  get(name) {
    if (this.applicationState.hasOwnProperty(name)) {
      return this.applicationState[name];
    } else {
      return null;
    }
  }

  toast(message, result?, duration?) {
    if (typeof(result) !== undefined) {
      message = message.replace("\{result\}", result)
    }
    this.toastCtrl.create({
      message: message,
      duration: duration || 3000
    }).present();
  }

  confirm(title, message, callback) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        handler: () => {}
      }, {
        text: 'Confirm',
        handler: callback
      }]
    });
    alert.present();
  }

  /**
  * Subscribe to BGService events
  */
  on(event, callback) {
    this.events.subscribe(event, callback);
  }

  /**
  * My private test config.
  * DO NOT USE
  * @private
  */
  async applyTestConfig(device) {

    let geofences = [{
      "identifier": "[Cordova] Home",
      "radius": 200,
      "latitude": 45.5192534,
      "longitude": -73.6169719,
      "notifyOnEntry": true,
      "notifyOnExit": true,
      "notifyOnDwell": true,
      "loiteringDelay": 10000,
      "extras": {
        "radius": 200,
        "center": {
          "latitude": 45.5192534,
          "longitude": -73.6169719
        }
      }
    }, {
      "identifier": "[Cordova] Jfk",
      "radius": 200,
      "latitude": 45.52193435702239,
      "longitude": -73.61602026242679,
      "notifyOnEntry": true,
      "notifyOnExit": true,
      "notifyOnDwell": true,
      "loiteringDelay": 10000,
      "extras": {
        "radius": 200,
        "center": {
          "latitude": 45.52193435702239,
          "longitude": -73.61602026242679
        }
      }
    }, {
      "identifier": "[Cordova] Laj",
      "radius": 200,
      "latitude": 45.52011166353691,
      "longitude": -73.61188565687189,
      "notifyOnEntry": true,
      "notifyOnExit": true,
      "notifyOnDwell": true,
      "loiteringDelay": 10000,
      "extras": {
        "radius": 200,
        "center": {
          "latitude": 45.52011166353691,
          "longitude": -73.61188565687189
        }
      }
    }, {
      "identifier": "[Cordova] Bernard",
      "radius": 200,
      "latitude": 45.51890341224348,
      "longitude": -73.60920346871359,
      "notifyOnEntry": true,
      "notifyOnExit": true,
      "notifyOnDwell": true,
      "loiteringDelay": 10000,
      "extras": {
        "radius": 200,
        "center": {
          "latitude": 45.51890341224348,
          "longitude": -73.60920346871359
        }
      }
    }, {
      "identifier": "[Cordova] Park",
      "radius": 200,
      "latitude": 45.51793055832324,
      "longitude": -73.60288022069346,
      "notifyOnEntry": true,
      "notifyOnExit": true,
      "notifyOnDwell": true,
      "loiteringDelay": 10000,
      "extras": {
        "radius": 200,
        "center": {
          "latitude": 45.51793055832324,
          "longitude": -73.60288022069346
        }
      }
    }, {
      "identifier": "[Cordova] Dollard",
      "radius": 200,
      "latitude": 45.51722612373795,
      "longitude": -73.61367125021673,
      "notifyOnEntry": true,
      "notifyOnExit": true,
      "notifyOnDwell": true,
      "loiteringDelay": 10000,
      "extras": {
        "radius": 200,
        "center": {
          "latitude": 45.51722612373795,
          "longitude": -73.61367125021673
        }
      }
    }];

    await BackgroundGeolocation.removeGeofences();
    await BackgroundGeolocation.addGeofences(geofences);

    let storage = (<any>window).localStorage;
    await BackgroundGeolocation.setConfig({
      debug: true,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
      distanceFilter: 50,
      locationUpdateInterval: 5000,
      fastestLocationUpdateInterval: -1,
      stopTimeout: 1,
      schedule: [
        //'2-6 09:00-17:00'
      ],
      scheduleUseAlarmManager: true,
      url: 'http://tracker.transistorsoft.com/locations/' + storage.getItem('username'),
      maxDaysToPersist: 14,
      params: BackgroundGeolocation.transistorTrackerParams(device),
      geofenceModeHighAccuracy: true,
      stopOnTerminate: false,
      startOnBoot: true,
      enableHeadless: true,
      heartbeatInterval: -1
    });
  }

  private loadState() {
    this.applicationState = JSON.parse(this.storage.getItem('settings'));
    let invalid = false;
    APP_SETTINGS.forEach((setting) => {
      if (!this.applicationState.hasOwnProperty(setting.name)) {
        this.applicationState[setting.name] = setting.defaultValue;
        invalid = true;
      }
    });
    if (!invalid) { this.saveState(); }

    this.myState = Object.assign({}, this.applicationState);
  }
  private saveState() {
    this.storage.setItem('settings', JSON.stringify(this.applicationState, null));
    this.myState = Object.assign({}, this.applicationState);
  }
}
