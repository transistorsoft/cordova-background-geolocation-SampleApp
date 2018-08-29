import {
  Component,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';

import {
  IonicPage,
  Platform,
  NavController,
  NavParams,
  ModalController
} from 'ionic-angular';

import { Dialogs } from '@ionic-native/dialogs';
import { Device } from '@ionic-native/device';

import {BGService} from './lib/BGService';
import {TestService} from './lib/TestService';
import {SettingsService} from './lib/SettingsService';
import {LongPress} from './lib/LongPress';

declare var google;

const CONTAINER_BORDER_POWER_SAVE_OFF = 'none';
const CONTAINER_BORDER_POWER_SAVE_ON = '7px solid red';

import COLORS from "../../lib/colors";
import ICON_MAP from "../../lib/icon-map";

// Messages
const MESSAGE = {
  reset_odometer_success: 'Reset odometer success',
  reset_odometer_failure: 'Failed to reset odometer: {result}',
  sync_success: 'Sync success ({result} records)',
  sync_failure: 'Sync error: {result}',
  destroy_locations_success: 'Destroy locations success ({result} records)',
  destroy_locations_failure: 'Destroy locations error: {result}',
  removing_markers: 'Removing markers...',
  rendering_markers: 'Rendering markers...'
}


/**
 * Generated class for the AdvancedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-advanced',
  templateUrl: 'advanced.html',
})
export class AdvancedPage {
  @ViewChild('map') mapElement: ElementRef;

  /**
  * @property {google.Map} Reference to Google Map instance
  */
  map: any;
  /**
  * @property {Object} state
  */
  state: any;
  /**
  * @property {BackgroundGeolocation} Reference to actual BackgroundGeolocation plugin
  */
  bgGeo: any;
  /**
  * @property {Object} lastLocation
  */
  lastLocation: any;
  /**
  * @property {Object} map of icons
  */
  iconMap: any;

  currentLocationMarker: any;
  locationAccuracyCircle:  any;
  geofenceHitMarkers: any;
  polyline: any;
  stationaryRadiusCircle: any;
  geofenceCursor: any;
  locationMarkers: any;
  geofenceMarkers: any;
  lastDirectionChangeLocation: any;

  // Geofence Hits
  geofenceHits: any;

  // FAB Menu
  isMainMenuOpen: boolean;
  isSyncing: boolean;
  isDestroyingLocations: boolean;
  isResettingOdometer: boolean;
  isEmailingLog: boolean;
  isMapMenuOpen: boolean;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalController: ModalController,
    private dialogs: Dialogs,
    private device: Device,
    private zone: NgZone,
    private platform: Platform,
    private bgService: BGService,
    public settingsService: SettingsService,
    private testService: TestService) {

    // FAB Menu state.
    this.isMainMenuOpen = false;
    this.isMapMenuOpen = false;
    this.isSyncing = false;
    this.isResettingOdometer = false;
    this.isEmailingLog = false;

    this.iconMap = ICON_MAP;

    this.geofenceHits = [];

    // Initial state
    this.state = {
      enabled: false,
      isMoving: false,
      geofenceProximityRadius: 1000,
      trackingMode: 'location',
      isChangingPace: false,
      activityIcon: this.iconMap['activity_unknown'],
      odometer: 0,
      provider: {
        gps: true,
        network: true,
        enabled: true,
        status: -1
      },
      containerBorder: 'none'
    };
  }

  ionViewDidLoad(){
    this.platform.ready().then(() => {
      this.configureMap();
      this.configureBackgroundGeolocation();
      this.configureBackgroundFetch();
    });
  }

  /**
  * Configure Google Maps
  */
  configureMap() {
    // Handle case where app booted without network accesss (google maps lib fails to load)
    if (typeof(google) !== 'object') {
      console.warn('- map not loaded');
      return;
    }
    this.locationMarkers = [];
    this.geofenceMarkers = [];
    this.geofenceHitMarkers = [];

    let latLng = new google.maps.LatLng(-34.9290, 138.6010);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: false,
      mapTypeControl: false,
      panControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    // Create LongPress event-handler
    new LongPress(this.map, 500);

    // Tap&hold detected.  Play a sound a draw a circular cursor.
    google.maps.event.addListener(this.map, 'longpresshold', this.onLongPressStart.bind(this));
    // Longpress cancelled.  Get rid of the circle cursor.
    google.maps.event.addListener(this.map, 'longpresscancel', this.onLongPressCancel.bind(this));
    // Longpress initiated, add the geofence
    google.maps.event.addListener(this.map, 'longpress', this.onLongPress.bind(this));

    // Blue current location marker
    this.currentLocationMarker = new google.maps.Marker({
      zIndex: 10,
      map: this.map,
      title: 'Current Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: COLORS.blue,
        fillOpacity: 1,
        strokeColor: COLORS.white,
        strokeOpacity: 1,
        strokeWeight: 6
      }
    });
    // Light blue location accuracy circle
    this.locationAccuracyCircle = new google.maps.Circle({
      map: this.map,
      zIndex: 9,
      fillColor: COLORS.light_blue,
      fillOpacity: 0.4,
      strokeOpacity: 0
    });
    // Stationary Geofence
    this.stationaryRadiusCircle = new google.maps.Circle({
      zIndex: 0,
      fillColor: COLORS.red,
      strokeColor: COLORS.red,
      strokeWeight: 1,
      fillOpacity: 0.3,
      strokeOpacity: 0.7,
      map: this.map
    });
    // Route polyline
    // Route polyline
    let seq = {
      repeat: '30px',
      icon: {
        path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
        scale: 1,
        fillOpacity: 0,
        strokeColor: COLORS.white,
        strokeWeight: 1,
        strokeOpacity: 1
      }
    };
    this.polyline = new google.maps.Polyline({
      map: (this.settingsService.applicationState.mapHidePolyline) ? null : this.map,
      zIndex: 1,
      geodesic: true,
      strokeColor: COLORS.polyline_color,
      strokeOpacity: 0.7,
      strokeWeight: 7,
      icons: [seq]
    });
    // Popup geofence cursor for adding geofences via LongPress
    this.geofenceCursor = new google.maps.Marker({
      clickable: false,
      zIndex: 100,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 100,
        fillColor: COLORS.green,
        fillOpacity: 0.2,
        strokeColor: COLORS.green,
        strokeWeight: 1,
        strokeOpacity: 0.7
      }
    });
  }

  /**
  * Configure BackgroundGeolocation plugin
  */
  async configureBackgroundGeolocation() {
    var bgGeo = this.bgService.getPlugin();

    // [optional] We first bind all our event-handlers to *this* so that we have the option to later remove these
    // listeners with bgGeo.un("event", this.onMyHandler), since the #bind method returns a new function instance.
    // To remove an event-handler requires a reference to the *exact* success-callback provided to #on
    // eg:
    //  this.onLocation = this.onLocation.bind(this);
    //  bgGeo.on("location", this.onLocation);  <-- add listener
    //  bgGeo.un("location", this.onLocation);  <-- remove listener
    // If you don't plan to remove events, this is unnecessary.
    //
    this.onLocation = this.onLocation.bind(this);
    this.onLocationError = this.onLocationError.bind(this);
    this.onMotionChange = this.onMotionChange.bind(this);
    this.onHeartbeat = this.onHeartbeat.bind(this);
    this.onGeofence = this.onGeofence.bind(this);
    this.onActivityChange = this.onActivityChange.bind(this);
    this.onProviderChange = this.onProviderChange.bind(this);
    this.onGeofencesChange = this.onGeofencesChange.bind(this);
    this.onSchedule = this.onSchedule.bind(this);
    this.onHttpSuccess = this.onHttpSuccess.bind(this);
    this.onHttpFailure = this.onHttpFailure.bind(this);
    this.onPowerSaveChange = this.onPowerSaveChange.bind(this);
    this.onConnectivityChange = this.onConnectivityChange.bind(this);
    this.onEnabledChange = this.onEnabledChange.bind(this);

    // Listen to BackgroundGeolocation events
    bgGeo.on('location', this.onLocation, this.onLocationError);
    bgGeo.on('motionchange', this.onMotionChange);
    bgGeo.on('heartbeat', this.onHeartbeat);
    bgGeo.on('geofence', this.onGeofence);
    bgGeo.on('activitychange', this.onActivityChange);
    bgGeo.on('providerchange', this.onProviderChange);
    bgGeo.on('geofenceschange', this.onGeofencesChange);
    bgGeo.on('schedule', this.onSchedule);
    bgGeo.on('http', this.onHttpSuccess, this.onHttpFailure);
    bgGeo.on('powersavechange', this.onPowerSaveChange);
    bgGeo.on('connectivitychange', this.onConnectivityChange);
    bgGeo.on('enabledchange', this.onEnabledChange);
    
    this.state.containerBorder = (await bgGeo.isPowerSaveMode()) ? CONTAINER_BORDER_POWER_SAVE_ON : CONTAINER_BORDER_POWER_SAVE_OFF;

    let username = localStorage.getItem('username');

    // With the plugin's #ready method, the supplied config object will only be applied with the first
    // boot of your application.  The plugin persists the configuration you apply to it.  Each boot thereafter,
    // the plugin will automatically apply the last known configuration.
    bgGeo.ready({
      reset: false,
      debug: true,
      logLevel: bgGeo.LOG_LEVEL_VERBOSE,
      distanceFilter: 10,
      stopTimeout: 1,
      maxDaysToPersist: 14,
      stopOnTerminate: false,
      startOnBoot: true,
      foregroundService: true,
      enableHeadless: true,
      url: 'http://tracker.transistorsoft.com/locations/' + username,
      params: {
        device: {
          model: this.device.model,
          platform: this.device.platform,
          uuid: this.device.uuid,
          version: this.device.version,
          manufacturer: this.device.manufacturer,
          framework: 'Cordova'
        }
      }
    }).then((state) => {
      // Store the plugin state onto ourself for convenience.
      console.log('- BackgroundGeolocation is ready: ', state);
      this.zone.run(() => {
        this.state.enabled = state.enabled;
        this.state.isMoving = state.isMoving;
        this.state.geofenceProximityRadius = state.geofenceProximityRadius;
        this.state.trackingMode = (state.trackingMode === 1 || state.trackingMode === 'location') ? 'location' : 'geofence';
      });
      if (!state.schedulerEnabled && (state.schedule.length > 0)) {
        bgGeo.startSchedule();
      }
    }).catch((error) => {
      console.warn('- BackgroundGeolocation configuration error: ', error);
    });
  }

  configureBackgroundFetch() {
    let BackgroundFetch = (<any>window).BackgroundFetch;

    BackgroundFetch.configure(() => {
      console.log('[BackgroundFetch] - Received fetch event');
      BackgroundFetch.finish();
    }, (error) => {
      console.warn('BackgroundFetch error: ', error);
    }, {
      minimumFetchInterval: 15, // <-- default is 15
      stopOnTerminate: false,   // <-- Android only
      startOnBoot: false,
      enableHeadless: true
    });
  }
  ////
  // UI event handlers
  //
  onClickMainMenu() {
    this.isMainMenuOpen = !this.isMainMenuOpen;
    if (this.isMainMenuOpen) {
      this.bgService.playSound('OPEN');
    } else {
      this.bgService.playSound('CLOSE');
    }
  }
  onClickSettings() {
    this.bgService.playSound('OPEN');
    let modal = this.modalController.create('SettingsPage', {
      bgService: this.bgService,
      settingsService: this.settingsService
    });
    modal.present();
  }

  async onClickSync() {
    this.bgService.playSound('BUTTON_CLICK');

    let onComplete = (message, result) => {
      this.settingsService.toast(message, result);
      this.zone.run(() => { this.isSyncing = false; })
    };

    let bgGeo = this.bgService.getPlugin();
    let count = await bgGeo.getCount();
    if (!count) {
      this.settingsService.toast('Database is empty.');
      return;
    }
    let message = 'Sync ' + count + ' location' + ((count>1) ? 's' : '') + '?';
    this.settingsService.confirm('Confirm Sync', message, () => {
      this.isSyncing = true;
      bgGeo.sync().then(rs => {
        this.bgService.playSound('MESSAGE_SENT');
        onComplete(MESSAGE.sync_success, count);
      }).catch(error => {
        onComplete(MESSAGE.sync_failure, error);
      });
    });
  }

  async onClickDestroyLocations() {
    this.bgService.playSound('BUTTON_CLICK');

    let zone = this.zone;
    let settingsService = this.settingsService;

    function onComplete(message, result) {
      settingsService.toast(message, result);
      zone.run(() => { this.isDestroyingLocations = false; })
    };

    let bgGeo = this.bgService.getPlugin();
    let count = await bgGeo.getCount();
    if (!count) {
      this.settingsService.toast('Locations database is empty');
      return;
    }
    // Confirm destroy
    let message = 'Destroy ' + count + ' location' + ((count>1) ? 's' : '') + '?';
    this.settingsService.confirm('Confirm Delete', message, () => {
      // Good to go...
      this.isDestroyingLocations = true;
      bgGeo.destroyLocations().then(result => {
        this.bgService.playSound('MESSAGE_SENT');
        onComplete.call(this, MESSAGE.destroy_locations_success, count);
      }).catch(error => {
        onComplete.call(this, MESSAGE.destroy_locations_failure, error);
      });
    });
  }

  onClickEmailLogs() {
    this.bgService.playSound('BUTTON_CLICK');
    let storage = (<any>window).localStorage;
    let email = storage.getItem('settings:email');
    if (!email) {
      // Prompt user to enter a unique identifier for tracker.transistorsoft.com
      this.dialogs.prompt('Please enter your email address', 'Email Address').then((response) => {
        if (response.buttonIndex === 1 && response.input1.length > 0) {
          storage.setItem('settings:email', response.input1);
          this.doEmailLog(response.input1);
        } else {
          return;
        }
      });
    } else {
      this.doEmailLog(email);
    }
  }

  doEmailLog(email) {
    let bgGeo = this.bgService.getPlugin();

    this.isEmailingLog = true;

    bgGeo.emailLog(email).then(result => {
      this.zone.run(() => {this.isEmailingLog = false; });
      console.log('- email log success');
    }).catch(error => {
      this.zone.run(() => {this.isEmailingLog = false; });
      console.warn('- email log failed: ', error);
    });
  }

  onClickResetOdometer() {
    this.state.odometer = '0.0';
    this.bgService.playSound('BUTTON_CLICK');
    let bgGeo = this.bgService.getPlugin();
    this.isResettingOdometer = true;
    this.resetMarkers();

    let zone = this.zone;
    let settingsService = this.settingsService;

    function onComplete(message, result?) {
      settingsService.toast(message, result);
      zone.run(() => { this.isResettingOdometer = false; })
    };

    bgGeo.resetOdometer((location) => {
      onComplete.call(this, MESSAGE.reset_odometer_success);
    }, (error) => {
      onComplete.call(this, MESSAGE.reset_odometer_failure, error);
    });
  }

  onClickHome() {
    this.navCtrl.setRoot('HomePage');
  }

  onClickMapMenu() {
    this.isMapMenuOpen = !this.isMapMenuOpen;
    let soundId = (this.isMapMenuOpen) ? 'OPEN' : 'CLOSE';
    this.bgService.playSound(soundId);
  }

  onSelectMapOption(name) {
    this.bgService.playSound('BUTTON_CLICK');
    // Invert the value
    let enabled = !this.settingsService.applicationState[name];

    // Save it:
    this.settingsService.set(name, enabled);

    // Apply it:
    let map = (enabled) ? null : this.map;
    let message = (enabled) ? 'Hide ' : 'Show ';
    switch(name) {
      case 'mapHideMarkers':
        this.locationMarkers.forEach((marker) => {
          marker.setMap(map);
        });
        message += 'map markers';
        break;
      case 'mapHidePolyline':
        this.polyline.setMap(map);
        message += 'polyline';
        break;
      case 'mapHideGeofenceHits':
        this.geofenceHitMarkers.forEach((marker) => {
          marker.setMap(map);
        });
        message += 'geofence transitions';
        break;
     }
     this.settingsService.toast(message, undefined, 1000);
  }

  onToggleEnabled() {
    this.bgService.playSound('BUTTON_CLICK');

    let bgGeo = this.bgService.getPlugin();
    if (this.state.enabled) {
      if ((this.state.trackingMode == 1) || (this.state.trackingMode === 'location')) {
        bgGeo.start(state => {
          console.log('[js] START SUCCESS :', state);
        }, error => {
          console.error('[js] START FAILURE: ', error);
        });
      } else {
        bgGeo.startGeofences();
      }
    } else {
      this.state.isMoving = false;
      bgGeo.stop();
      this.clearMarkers();
    }
  }

  onClickGetCurrentPosition() {
    this.bgService.playSound('BUTTON_CLICK');
    let bgGeo = this.bgService.getPlugin();

    bgGeo.getCurrentPosition({
      maximumAge: 0,
      desiredAccuracy: 100,
      samples: 1,
      persist: true,
      timeout: 30,
      extras: {
        foo: 'bar'
      }
    }).then(location => {
      console.log('[js] getCurrentPosition: ', location);
    }).catch(error => {
      console.warn('[js] getCurrentPosition FAILURE: ', error);
    });    
  }

  onClickChangePace() {
    if (!this.state.enabled) {
      return;
    }
    let zone = this.zone;
    let onComplete = () => {
      zone.run(() => { this.state.isChangingPace = false; })
    }
    this.bgService.playSound('BUTTON_CLICK');
    let bgGeo = this.bgService.getPlugin();

    this.state.isChangingPace = true;
    this.state.isMoving = !this.state.isMoving;
    bgGeo.changePace(this.state.isMoving).then(onComplete).catch(onComplete);
  }

  ////
  // Map events
  //
  onLongPressStart(e) {
    this.bgService.playSound('LONG_PRESS_ACTIVATE');
    this.geofenceCursor.setPosition(e.latLng);
    this.geofenceCursor.setMap(this.map);
  }

  onLongPressCancel(e) {
    this.bgService.playSound('LONG_PRESS_CANCEL');
    this.geofenceCursor.setMap(null);
  }

  onLongPress(e) {
    var latlng = e.latLng;
    this.geofenceCursor.setMap(null);
    let modal = this.modalController.create('GeofencePage', {
      bgService: this.bgService,
      latitude: latlng.lat(),
      longitude: latlng.lng()
    });
    modal.present();
  }

  ////
  // Background Geolocation event-listeners
  //
  //
  //
  //

  /**
  * @event location
  */
  onLocation(location:any) {
    console.log('[event] - location: ', location);
    this.setCenter(location);
    if (!location.sample) {
      this.zone.run(() => {
        // Convert meters -> km -> round nearest hundredth -> fix float xxx.x
        this.state.odometer = parseFloat((Math.round((location.odometer/1000)*10)/10).toString()).toFixed(1);
      });
    }
  }
  /**
  * @event location failure
  */
  onLocationError(error:any) {
    console.warn('[event] - location error: ', error);
  }
  /**
  * @event motionchange
  */
  onMotionChange(isMoving:boolean, location:any) {
    console.log('[event] - motionchange: ', isMoving, location);
    let bgGeo = this.bgService.getPlugin();
    if (isMoving) {
      this.hideStationaryCircle();
    } else {
      this.showStationaryCircle(location);
    }
    this.zone.run(() => {
      this.state.enabled = true;
      this.state.isChangingPace = false;
      this.state.isMoving = isMoving;
    });
  }
  /**
  * @event heartbeat
  */
  onHeartbeat(event:any) {
    console.log('[event] - heartbeat', event);
  }
  /**
  * @event activitychange
  */
  onActivityChange(event:any) {
    this.zone.run(() => {
      this.state.activityName = event.activity;
      this.state.activityIcon = this.iconMap['activity_' + event.activity];
    });
    console.log('[event] - activitychange: ', event.activity, event.confidence);
  }
  /**
  * @event providerchange
  */
  onProviderChange(provider:any) {
    console.log('[event] - providerchange: ', provider);
    let bgGeo = this.bgService.getPlugin();

    switch(provider.status) {
      case bgGeo.AUTHORIZATION_STATUS_DENIED:
        break;
      case bgGeo.AUTHORIZATION_STATUS_ALWAYS:
        break;
      case bgGeo.AUTHORIZATION_STATUS_WHEN_IN_USE:
        break;
    }

    this.zone.run(() => { this.state.provider = provider; });
  }
  /**
  * @event geofenceschange
  */
  onGeofencesChange(event:any) {
    console.log('[event] - geofenceschange: ', event);
    // All geofences off
    if (!event.on.length && !event.off.length) {
      this.geofenceMarkers.forEach((circle) => {
        circle.setMap(null);
      });
      this.geofenceMarkers = [];
      return;
    }

    // Filter out all "off" geofences.
    this.geofenceMarkers = this.geofenceMarkers.filter((circle) => {
      if (event.off.indexOf(circle.identifier) < 0) {
        return true;
      } else {
        circle.setMap(null);
        return false;
      }
    });

    // Add new "on" geofences.
    event.on.forEach((geofence) => {
      var circle = this.geofenceMarkers.find((marker) => { return marker.identifier === geofence.identifier;});
      // Already added?
      if (circle) { return; }
      this.geofenceMarkers.push(this.buildGeofenceMarker(geofence));
    });

  }
  /**
  * @event geofence
  */
  onGeofence(event:any) {
    console.log('[event] - geofence: ', event);
    var circle = this.geofenceMarkers.find((marker) => {
      return marker.identifier === event.identifier;
    });

    if (!circle) { return; }
    var map = (this.settingsService.applicationState.mapHideGeofenceHits) ? null : this.map;

    let location = event.location;
    let geofence = this.geofenceHits[event.identifier];
    if (!geofence) {
      geofence = {
        circle: new google.maps.Circle({
          zIndex: 100,
          fillOpacity: 0,
          strokeColor: COLORS.black,
          strokeWeight: 1,
          strokeOpacity: 1,
          radius: circle.getRadius()+1,
          center: circle.getCenter(),
          map: map
        }),
        events: []
      };
      this.geofenceHits[event.identifier] = geofence;
      this.geofenceHitMarkers.push(geofence.circle);
    }

    var color;
    if (event.action === 'ENTER') {
      color = COLORS.green;
    } else if (event.action === 'DWELL') {
      color = COLORS.gold;
    } else {
      color = COLORS.red;
    }

    let circleLatLng = geofence.circle.getCenter();
    let locationLatLng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    let distance = google.maps.geometry.spherical.computeDistanceBetween (circleLatLng, locationLatLng);

    // Push event
    geofence.events.push({
      action: event.action,
      location: event.location,
      distance: distance
    });

    let heading = google.maps.geometry.spherical.computeHeading(circleLatLng, locationLatLng);
    let circleEdgeLatLng = google.maps.geometry.spherical.computeOffset(circleLatLng, geofence.circle.getRadius(), heading);

    geofence.events.push({
      location: event.location,
      action: event.action,
      distance: distance
    });

    var geofenceEdgeMarker = new google.maps.Marker({
      zIndex: 1000,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 5,
        fillColor: color,
        fillOpacity: 0.7,
        strokeColor: COLORS.black,
        strokeWeight: 1,
        strokeOpacity: 1
      },
      map: map,
      position: circleEdgeLatLng
    });
    this.geofenceHitMarkers.push(geofenceEdgeMarker);

    var locationMarker = this.buildLocationMarker(location, {
      showHeading: true
    });
    locationMarker.setMap(map);
    this.geofenceHitMarkers.push(locationMarker);

    var polyline = new google.maps.Polyline({
      map: map,
      zIndex: 1000,
      geodesic: true,
      strokeColor: COLORS.black,
      strokeOpacity: 1,
      strokeWeight: 1,
      path: [circleEdgeLatLng, locationMarker.getPosition()]
    });
    this.geofenceHitMarkers.push(polyline);

    // Change the color of activated geofence to light-grey.
    circle.activated = true;
    circle.setOptions({
      fillColor: COLORS.grey,
      fillOpacity: 0.2,
      strokeColor: COLORS.grey,
      strokeOpacity: 0.4
    });
  }
  /**
  * @event http
  */
  onHttpSuccess(response) {
    console.log('[event] http - success: ', response);
  }
  /**
  * @event http failure
  */
  onHttpFailure(response) {
    console.log('[event] http - FAILURE: ', response);
  }
  /**
  * @event schedule
  */
  onSchedule(state) {
    this.zone.run(() => {
      this.state.enabled = state.enabled;
    });

    console.log('[event] - schedule: ', state);
  }
  /**
  * @event powersavechange
  */
  onPowerSaveChange(isPowerSaveMode) {
    console.log('[js powersavechange: ', isPowerSaveMode);
    this.settingsService.toast('Power-save mode: ' + ((isPowerSaveMode) ? 'ON' : 'OFF'), null, 5000);
    this.zone.run(() => {
      this.state.containerBorder = (isPowerSaveMode) ? CONTAINER_BORDER_POWER_SAVE_ON : CONTAINER_BORDER_POWER_SAVE_OFF;
    });
  }
  /**
  * @event connectivitychange
  */
  onConnectivityChange(event) {
    this.settingsService.toast('connectivitychange: ' + event.connected);
    console.log('[event] - connectivitychange: ', event);
  }
  /**
  * @event enabledchange
  */
  onEnabledChange(event) {
    this.settingsService.toast('enabledchange: ' + event.enabled);
    console.log('[event] - enabledchange: ', event);
  }
  ////
  // Google map methods
  //
  //
  //
  private setCenter(location) {
    this.updateCurrentLocationMarker(location);
    setTimeout(function() {
      this.map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
    }.bind(this));
  }

  private updateCurrentLocationMarker(location) {
    var latlng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    this.currentLocationMarker.setPosition(latlng);
    this.locationAccuracyCircle.setCenter(latlng);
    this.locationAccuracyCircle.setRadius(location.coords.accuracy);

    if (location.sample === true) {
      return;
    }
    if (this.lastLocation) {
      this.locationMarkers.push(this.buildLocationMarker(location));
    }
    // Add breadcrumb to current Polyline path.
    this.polyline.getPath().push(latlng);
    if (!this.state.mapHidePolyline) {
      this.polyline.setMap(this.map);
    }
    this.lastLocation = location;
  }

  // Build a bread-crumb location marker.
  private buildLocationMarker(location, options?) {
    options = options || {};
    var icon = google.maps.SymbolPath.CIRCLE;
    var scale = 3;
    var zIndex = 1;
    var anchor;
    var strokeWeight = 1;

    if (!this.lastDirectionChangeLocation) {
      this.lastDirectionChangeLocation = location;
    }

    // Render an arrow marker if heading changes by 10 degrees or every 5 points.
    var deltaHeading = Math.abs(location.coords.heading - this.lastDirectionChangeLocation.coords.heading);
    if ((deltaHeading >= 15) || !(this.locationMarkers.length % 5) || options.showHeading) {
      icon = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
      scale = 2;
      strokeWeight = 1;
      anchor = new google.maps.Point(0, 2.6);
      this.lastDirectionChangeLocation = location;
    }

    return new google.maps.Marker({
      zIndex: zIndex,
      icon: {
        path: icon,
        rotation: location.coords.heading,
        scale: scale,
        anchor: anchor,
        fillColor: COLORS.polyline_color,
        fillOpacity: 1,
        strokeColor: COLORS.black,
        strokeWeight: strokeWeight,
        strokeOpacity: 1
      },
      map: (!this.settingsService.applicationState.mapHideMarkers) ? this.map : null,
      position: new google.maps.LatLng(location.coords.latitude, location.coords.longitude)
    });
  }

  buildGeofenceMarker(params) {
    // Add longpress event for adding GeoFence of hard-coded radius 200m.
    var geofence = new google.maps.Circle({
      identifier: params.identifier,
      zIndex: 100,
      fillColor: COLORS.green,
      fillOpacity: 0.2,
      strokeColor: COLORS.green,
      strokeWeight: 1,
      strokeOpacity: 0.7,
      params: params,
      radius: parseInt(params.radius, 10),
      center: new google.maps.LatLng(params.latitude, params.longitude),
      map: this.map
    });
    // Add 'click' listener to geofence so we can edit it.
    google.maps.event.addListener(geofence, 'click', () => {
      this.settingsService.toast('Click geofence ' + geofence.identifier, null, 1000);
    });
    return geofence;
  }

  buildStopZoneMarker(latlng:any) {
    return new google.maps.Marker({
      zIndex: 1,
      map: this.map,
      position: latlng,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: COLORS.red,
        fillOpacity: 0.3,
        strokeColor: COLORS.red,
        strokeWeight: 1,
        strokeOpacity: 0.7
      }
    });
  }

  showStationaryCircle(location:any) {
    var coords = location.coords;
    var radius = ((this.state.trackingMode == 1) || (this.state.trackingMode === 'location')) ? 200 : (this.state.geofenceProximityRadius / 2);
    var center = new google.maps.LatLng(coords.latitude, coords.longitude);

    this.stationaryRadiusCircle.setRadius(radius);
    this.stationaryRadiusCircle.setCenter(center);
    this.stationaryRadiusCircle.setMap(this.map);
    this.map.setCenter(center);
  }

  hideStationaryCircle() {
    // Create a little red breadcrumb circle of our last stop-position
    var latlng = this.stationaryRadiusCircle.getCenter();
    var stopZone = this.buildStopZoneMarker(latlng);
    var lastMarker = this.locationMarkers.pop();
    if (lastMarker) {
      lastMarker.setMap(null);
    }
    this.locationMarkers.push(stopZone);
    this.stationaryRadiusCircle.setMap(null);
  }

  resetMarkers() {
    // Clear location-markers.
    this.locationMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    this.locationMarkers = [];

    // Clear geofence hit markers
    this.geofenceHitMarkers.forEach((marker) => {
      marker.setMap(null);
    })

    this.polyline.setPath([]);
  }

  clearMarkers() {
    this.resetMarkers();

    this.geofenceMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    this.geofenceMarkers = [];

    // Clear red stationaryRadius marker
    this.stationaryRadiusCircle.setMap(null);

    // Clear blue route PolyLine
    this.polyline.setMap(null);
    this.polyline.setPath([]);
  }

  alert(title, message) {

  }
}
