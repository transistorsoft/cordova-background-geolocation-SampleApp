import {
  Events
} from 'ionic-angular';
import {Injectable} from "@angular/core";

const SETTINGS = [

  {name: 'geofenceRadius', defaultValue: 200},
  {name: 'geofenceNotifyOnEntry', defaultValue: true},
  {name: 'geofenceNotifyOnExit', defaultValue: false},
  {name: 'geofenceNotifyOnDwell', defaultValue: false},
  {name: 'geofenceLoiteringDelay', defaultValue: 0},
  {name: 'mapHideMarkers', defaultValue: false},
  {name: 'mapHidePolyline', defaultValue: false},
  {name: 'mapShowGeofenceHits', defaultValue: false},
  {name: 'email', defaultValue: null}
];

const GEOFENCE_RADIUS_OPTIONS = [50, 100, 150, 200, 500, 1000];

@Injectable()

export class SettingsService {

  public state:any;
  private myState:any;
  private storage:any;
  public geofenceRadiusOptions: any;

  constructor(private events:Events) {
    this.storage = (<any>window).localStorage;

    this.geofenceRadiusOptions = GEOFENCE_RADIUS_OPTIONS;

    this.state = {};
    if (this.storage.hasOwnProperty('settings')) {
      this.loadState();
    } else {
      SETTINGS.forEach((setting) => {
        this.state[setting.name] = setting.defaultValue;
      });
      this.saveState();
    }
  }

  getSettings() {
    return this.state;
  }

  onChange(name) {
    if (this.myState[name] === this.state[name]) {
      return;
    }
    this.saveState();
    this.events.publish('change', name, this.state[name]);
  }

  set(name, value) {
    if (!this.state.hasOwnProperty(name)) {
      console.warn("SettingsService#set: Unknown property ", name);
      return;
    }
    if (this.myState[name] === value) {
      return;
    }
    this.state[name] = value;
    this.saveState();
    this.events.publish('change', name, value);
  }

  get(name) {
    if (this.state.hasOwnProperty(name)) {
      return this.state[name];
    } else {
      return null;
    }
  }

  /**
  * Subscribe to BGService events
  */
  on(event, callback) {
    this.events.subscribe(event, callback);
  }

  private loadState() {
    this.state = JSON.parse(this.storage.getItem('settings'));
    let inValid = false;
    SETTINGS.forEach((setting) => {
      if (!this.state.hasOwnProperty(setting.name)) {
        this.state[setting.name] = setting.defaultValue;
        inValid = true;
      }
    });
    if (!inValid) { this.saveState(); }

    this.myState = Object.assign({}, this.state);
  }
  private saveState() {
    this.storage.setItem('settings', JSON.stringify(this.state, null));
    this.myState = Object.assign({}, this.state);
  }
}
