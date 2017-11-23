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
  ModalController,
  LoadingController
} from 'ionic-angular';

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
  isMapMenuOpen: boolean;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private modalController: ModalController,
    private zone: NgZone,
    private platform: Platform,
    private bgService: BGService,
    public settingsService: SettingsService,
    private testService: TestService) {  

    this.bgService.on('change', this.onBackgroundGeolocationSettingsChanged.bind(this));
    this.bgService.on('start', this.onBackgroundGeolocationStarted.bind(this));

    this.settingsService.on('change', this.onSettingsChanged.bind(this));

    this.isMainMenuOpen = false;
    this.isMapMenuOpen = false;
    this.isSyncing = false;
    this.isResettingOdometer = false;

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
    }

    this.platform.ready().then(this.onDeviceReady.bind(this));
  }  

  onDeviceReady() {
    console.log('- bgServivce: ', this.bgService.getPlugin());

  }

  ionViewDidLoad(){
    this.platform.ready().then(() => {
      this.configureMap();
      this.configureBackgroundGeolocation();
    });
  }

  /**
  * Configure Google Maps
  */
  configureMap(){
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
      map: (this.settingsService.state.mapHidePolyline) ? null : this.map,
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
  configureBackgroundGeolocation() {
    var bgGeo = this.bgService.getPlugin();

    // Listen to events
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


    bgGeo.isPowerSaveMode((isPowerSaveMode) => {
      this.state.containerBorder = (isPowerSaveMode) ? CONTAINER_BORDER_POWER_SAVE_ON : CONTAINER_BORDER_POWER_SAVE_OFF;
    });

    // Fetch current settings from BGService
    this.bgService.getState((config) => {
      config.notificationLargeIcon = 'drawable/notification_large_icon';
      
      ////
      // Override config options here
      // config.url = 'http://192.168.11.200:9000/locations';
      //
      config.locationTemplate = '';
      config.schedule = [];
      //config.schedule = this.testService.generateSchedule(30*24, 1, 1, 1);      

      bgGeo.configure(config, (state) => {
        this.zone.run(() => {
          this.state.enabled = config.enabled;
          this.state.isMoving = config.isMoving;
          this.state.geofenceProximityRadius = config.geofenceProximityRadius;
          this.state.trackingMode = (state.trackingMode === 1 || state.trackingMode === 'location') ? 'location' : 'geofence';
        });
        if (state.schedule.length > 0) {
          bgGeo.startSchedule();
        }
        console.log('[js] Confgure success');
      });
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

  onClickSync() {
    this.bgService.playSound('BUTTON_CLICK');

    function onComplete(message, result) {
      this.settingsService.toast(message, result);
      this.zone.run(() => { this.isSyncing = false; })
    };

    let bgGeo = this.bgService.getPlugin();
    bgGeo.getCount((count) => {
      let message = 'Sync ' + count + ' location' + ((count>1) ? 's' : '') + '?';
      this.settingsService.confirm('Confirm Sync', message, () => {
        this.isSyncing = true;
        bgGeo.sync((rs, taskId) => {
          this.bgService.playSound('MESSAGE_SENT');
          bgGeo.finish(taskId);
          onComplete.call(this, MESSAGE.sync_success, count);
        }, (error) => {
          onComplete.call(this, MESSAGE.sync_failure, error);
        });
      });
    });
  }

  onClickDestroyLocations() {
    this.bgService.playSound('BUTTON_CLICK');

    let zone = this.zone;
    let settingsService = this.settingsService;

    function onComplete(message, result) {
      settingsService.toast(message, result);
      zone.run(() => { this.isDestroyingLocations = false; })
    };

    let bgGeo = this.bgService.getPlugin();
    bgGeo.getCount((count) => {
      if (!count) {
        this.settingsService.toast('Locations database is empty');
        return;
      }
      // Confirm destroy
      let message = 'Destroy ' + count + ' location' + ((count>1) ? 's' : '') + '?';
      this.settingsService.confirm('Confirm Delete', message, () => {
        // Good to go...
        this.isDestroyingLocations = true;
        bgGeo.destroyLocations((res) => {
          onComplete.call(this, MESSAGE.destroy_locations_success, count);
        }, function(error) {
          onComplete.call(this, MESSAGE.destroy_locations_failure, error);
        });
      });
    });
  }

  onClickEmailLogs() {
    this.bgService.playSound('BUTTON_CLICK');
    let storage = (<any>window).localStorage;
    let email = storage.getItem('settings:email');
    if (!email) {
      this.settingsService.toast('Please enter an email address in the Settings screen');
      return;
    }
    var bgGeo = this.bgService.getPlugin();
    bgGeo.emailLog(email, () => {
      bgGeo.destroyLog();
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
     this.settingsService.state[name] = !this.settingsService.state[name];
     this.settingsService.set(name, this.settingsService.state[name]);
  }

  onToggleEnabled() {
    this.bgService.playSound('BUTTON_CLICK');

    let bgGeo = this.bgService.getPlugin();
    if (this.state.enabled) {
      if (this.bgService.isLocationTrackingMode()) {
        bgGeo.start(function() {
          console.warn('[js] START SUCCESS');
        }, function(error) {
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

    bgGeo.getCurrentPosition((location, taskId) => {
      console.log('- getCurrentPosition sample: ', location.sample, location.uuid);
      console.log('[js] getCurrentPosition: ', location);
      bgGeo.finish(taskId);
    }, function(error) {
      console.warn('[js] getCurrentPosition FAILURE: ', error);
    }, {
      maximumAge: 1000,
      desiredAccuracy: 10
    });
  }

  onClickChangePace() {
    if (!this.state.enabled) {
      return;
    }
    let zone = this.zone;
    function onComplete() {
      zone.run(() => { this.isChangingPace = false; })
    }
    this.bgService.playSound('BUTTON_CLICK');
    let bgGeo = this.bgService.getPlugin();

    this.state.isChangingPace = true;
    this.state.isMoving = !this.state.isMoving;
    bgGeo.changePace(this.state.isMoving, () => {
      onComplete.call(this);
    }, (error) => {
      onComplete.call(this);
      alert('Failed to changePace');
    });
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
  // SettingsService listeners
  //
  onSettingsChanged(name:string, value:any) {
    let map = null;

    switch(name) {
      case 'mapHideMarkers':
        var loader = this.loadingCtrl.create({
          content: (value) ? MESSAGE.removing_markers : MESSAGE.rendering_markers
        });
        loader.present();
        map = (value === true) ? null : this.map;
        this.locationMarkers.forEach((marker) => {
          marker.setMap(map);
        });
        loader.dismiss();
        this.settingsService.toast((value) ? 'Hide location markers' : 'Show location markers', null, 1000);
        break;
      case 'mapHidePolyline':
        map = (value === true) ? null : this.map;
        this.polyline.setMap(map);
        this.settingsService.toast((value) ? 'Hide  polyline' : 'Show polyline', null, 1000);
        break;
      case 'mapShowGeofenceHits':
        map = (value === true) ? this.map : null;
        this.geofenceHitMarkers.forEach((marker) => {
          marker.setMap(map);
        });
        this.settingsService.toast((value) ? 'Show geofence hits' : 'Hide geofence hits', null, 1000);
        break;
    }
  }

  ////
  // BgService listeners
  //
  onBackgroundGeolocationSettingsChanged(name:string, value:any) {
    console.log('Home settingschanged: ', name, value);
    switch(name) {
      case 'geofenceProximityRadius':
        this.state.geofenceProximityRadius = value;
        this.stationaryRadiusCircle.setRadius(value/2);
        break;
    }
  }

  onBackgroundGeolocationStarted(trackingMode:string, state:any) {
    this.zone.run(() => {
      this.state.enabled = state.enabled;
      this.state.isMoving = state.isMoving;
    });
  }
  ////
  // Background Geolocation event-listeners
  //
  onLocation(location:any, taskId:any) {
    console.log('[js] location: ', location);
    let bgGeo = this.bgService.getPlugin();
    this.setCenter(location);
    if (!location.sample) {
      this.zone.run(() => {
        // Convert meters -> km -> round nearest hundredth -> fix float xxx.x
        this.state.odometer = parseFloat((Math.round((location.odometer/1000)*10)/10).toString()).toFixed(1);
      });
    }
    bgGeo.finish(taskId);
  }

  onLocationError(error:any) {
    console.warn('[js] location error: ', error);
  }

  onMotionChange(isMoving:boolean, location:any, taskId:any) {
    console.log('[js] motionchange: ', isMoving, location);
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
    bgGeo.finish(taskId);
  }

  onHeartbeat(event:any) {
    console.log('[js] heartbeat', event);
  }

  onActivityChange(event:any) {
    this.zone.run(() => {
      this.state.activityName = event.activity;
      this.state.activityIcon = this.iconMap['activity_' + event.activity];
    });
    console.log('[js] activitychange: ', event.activity, event.confidence);
  }

  onProviderChange(provider:any) {
    console.log('[js] providerchange: ', provider);
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

  onGeofencesChange(event:any) {
    console.log('[js] geofenceschange: ', event);

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

  onGeofence(event:any) {
    console.log('[js] geofence: ', event);

    // DEBUG:
    // Stop tracking on ENTER
    // Start tracking on EXIT
    /*
    if (event.action === 'EXIT') {
      this.bgService.getPlugin().start();
    } else if (event.action === 'ENTER') {
      this.bgService.getPlugin().startGeofences();
    }
    */

    var circle = this.geofenceMarkers.find((marker) => {
      return marker.identifier === event.identifier;
    });

    if (!circle) { return; }
    var map = (this.settingsService.state.mapShowGeofenceHits) ? this.map : null;

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

  onHttpSuccess(response) {
    console.log('[js] http success: ', response);
  }

  onSchedule(state) {
    this.zone.run(() => {
      this.state.enabled = state.enabled;
    });
    
    console.log('[js] schedule: ', state);
  }

  onHttpFailure(response) {
    console.log('[js] http FAILURE: ', response);
  }

  onPowerSaveChange(isPowerSaveMode) {
    console.log('[js powersavechange: ', isPowerSaveMode);
    this.settingsService.toast('Power-save mode: ' + ((isPowerSaveMode) ? 'ON' : 'OFF'), null, 5000);
    this.zone.run(() => {
      this.state.containerBorder = (isPowerSaveMode) ? CONTAINER_BORDER_POWER_SAVE_ON : CONTAINER_BORDER_POWER_SAVE_OFF;
    });
  }

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
    if (!this.settingsService.state.mapHidePolyline) {
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
      map: (!this.settingsService.state.mapHideMarkers) ? this.map : null,
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
    var radius = this.bgService.isLocationTrackingMode() ? 200 : (this.state.geofenceProximityRadius / 2);
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
