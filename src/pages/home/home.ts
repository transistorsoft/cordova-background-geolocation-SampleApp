import {
  Component,
  ViewChild,
  ElementRef,
  NgZone
} from '@angular/core';

import {
  NavController,
  Platform,
  ModalController,
} from 'ionic-angular';

import {SettingsPage} from '../settings/settings';
import {GeofencePage} from '../geofence/geofence';
import {BGService} from '../../lib/BGService';
import {LongPress} from '../../lib/LongPress';

declare var google;

// Colors
const COLORS = {
  geofence_fill_color: "#11b700",
  geofence_stroke_color: "#11b700",
  geofence_fill_color_activated: "#404040",
  geofence_stroke_color_activated: "404040",
  marker_fill_color: "#11b700",
  marker_stroke_color: "#0d6104",
  stationary_geofence_fill_color: "#c80000",
  stationary_geofence_stroke_color: "#aa0000",
  current_location_fill_color: "#2677FF",
  current_location_stroke_color: "#ffffff",
  current_location_accuracy_fill_color: "#3366cc",
  polyline_stroke_color: "#2677FF"
}
// Icons
const ICON_MAP = {
  activity_unknown: "help-circle",
  activity_still: "body",
  activity_shaking: "walk",
  activity_on_foot: "walk",
  activity_walking: "walk",
  activity_running: "walk",
  activity_on_bicycle: "bicycle",
  activity_in_vehicle: "car",
  pace_true: "pause",
  pace_false: "play",
  provider_network: "wifi",
  provider_gps: "locate",
  provider_disabled: "warning"
};

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

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
  polyline: any;
  stationaryRadiusCircle: any;
  geofenceCursor: any;
  locationMarkers: any;
  geofenceMarkers: any;
  lastDirectionChangeLocation: any;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public bgService:BGService,
    public zone:NgZone,
    public modalController: ModalController) {

    this.iconMap = ICON_MAP;

    // Initial state
    this.state = {
      enabled: false,
      isMoving: false,
      paceIcon: this.iconMap['pace_false'],
      isChangingPace: false,
      activityIcon: this.iconMap['activity_unknown'],
      odometer: 0,
      provider: {
        gps: true,
        network: true,
        enabled: true,
        status: -1
      }
    }
  }

  ionViewDidLoad(){
    this.platform.ready().then(() => {
      this.bgGeo = this.bgService.getPlugin();
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

    let latLng = new google.maps.LatLng(-34.9290, 138.6010);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      zoomControl: false,
      mapTypeControl: false
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
        fillColor: COLORS.current_location_fill_color,
        fillOpacity: 1,
        strokeColor: COLORS.current_location_stroke_color,
        strokeOpacity: 1,
        strokeWeight: 6
      }
    });
    // Light blue location accuracy circle
    this.locationAccuracyCircle = new google.maps.Circle({
      map: this.map,
      zIndex: 9,
      fillColor: COLORS.current_location_accuracy_fill_color,
      fillOpacity: 0.4,
      strokeOpacity: 0
    });
    // Stationary Geofence
    this.stationaryRadiusCircle = new google.maps.Circle({
      zIndex: 0,
      fillColor: COLORS.stationary_geofence_fill_color,
      strokeColor: COLORS.stationary_geofence_stroke_color,
      strokeWeight: 2,
      fillOpacity: 0.2,
      strokeOpacity: 0.5,
      map: this.map
    });
    // Route polyline
    this.polyline = new google.maps.Polyline({
      map: this.map,
      zIndex: 1,
      geodesic: true,
      strokeColor: COLORS.polyline_stroke_color,
      strokeOpacity: 0.7,
      strokeWeight: 5
    });
    // Popup geofence cursor for adding geofences via LongPress
    this.geofenceCursor = new google.maps.Marker({
      clickable: false,
      zIndex: 100,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 100,
        fillColor: COLORS.geofence_fill_color,
        fillOpacity: 0.2,
        strokeColor: COLORS.geofence_stroke_color,
        strokeWeight: 2,
        strokeOpacity: 0.5
      }
    });
  }

  /**
  * Configure BackgroundGeolocation plugin
  */
  configureBackgroundGeolocation() {
    var bgGeo = this.bgService.getPlugin();

    // Listen to events
    bgGeo.on('location', this.onLocation.bind(this));
    bgGeo.on('motionchange', this.onMotionChange.bind(this));
    bgGeo.on('geofence', this.onGeofence.bind(this));
    bgGeo.on('activitychange', this.onActivityChange.bind(this));
    bgGeo.on('providerchange', this.onProviderChange.bind(this));
    bgGeo.on('geofenceschange', this.onGeofencesChange.bind(this))
    bgGeo.on('http', this.onHttpSuccess.bind(this), this.onHttpFailure.bind(this));

    // Fetch current settings from BGService
    this.bgService.getState((config) => {
      // Configure
      config.url = 'http://192.168.11.100:8080/locations';
      bgGeo.configure(config, (state) => {
        this.zone.run(() => {
          this.state.enabled = config.enabled;
          this.state.isMoving = config.isMoving;
          this.state.paceIcon = this.iconMap['pace_' + config.isMoving];
        });
        console.log('- Conigure success: ', state);
      });
    });
  }

  ////
  // UI event handlers
  //
  onClickSettings() {
    //this.navCtrl.push(SettingsPage);
    this.bgService.playSound('OPEN');
    let modal = this.modalController.create(SettingsPage, {});
    modal.present();
  }

  onToggleEnabled() {
    this.bgService.playSound('BUTTON_CLICK');
    if (this.state.enabled) {
      this.bgGeo.start();
    } else {
      this.state.paceIcon = this.iconMap['pace_false'];
      this.state.isMoving = false;
      this.bgGeo.stop();
      this.clearMarkers();
    }
  }

  onClickGetCurrentPosition() {
    this.bgService.playSound('BUTTON_CLICK');
    var bgGeo = this.bgGeo;
    bgGeo.getCurrentPosition((location, taskId) => {
      console.log('[js] getCurrentPosition: ', location);
      bgGeo.finish(taskId);
    }, function(error) {
      console.warn('[js] getCurrentPosition FAILURE: ', error);
      alert('Location error: ' + error);
    });
  }

  onClickChangePace() {
    if (!this.state.enabled) {
      return;
    }
    function onComplete() {
      this.zone.run(() => { this.isChangingPace = false; })
    }
    this.bgService.playSound('BUTTON_CLICK');
    this.state.isChangingPace = true;
    this.state.isMoving = !this.state.isMoving;
    this.state.paceIcon = this.iconMap['pace_' + this.state.isMoving];
    this.bgGeo.changePace(this.state.isMoving, () => {
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
    let modal = this.modalController.create(GeofencePage, {
      latitude: latlng.lat(),
      longitude: latlng.lng()
    });
    modal.present();
  }

  ////
  // Background Geolocation event-listeners
  //
  onLocation(location:any, taskId:any) {
    console.log('- Location: ', location);
    this.setCenter(location);
    if (!location.sample) {
      this.zone.run(() => {
        // Convert meters -> km -> round nearest hundredth -> fix float xxx.x
        this.state.odometer = parseFloat((Math.round((location.odometer/1000)*10)/10).toString()).toFixed(1);
      });
    }
    this.bgGeo.finish(taskId);
  }

  onMotionChange(isMoving:boolean, location:any, taskId:any) {
    console.log('[js] motionchange: ', isMoving, location);
    if (isMoving) {
      this.hideStationaryCircle();
    } else {
      this.showStationaryCircle(location);
    }
    this.zone.run(() => {
      this.state.paceIcon = this.iconMap['pace_' + isMoving];
      this.state.isChangingPace = false;
      this.state.isMoving = isMoving;
    });
    this.bgGeo.finish(taskId);
  }

  onActivityChange(activityName:string) {
    this.zone.run(() => {
      this.state.activityName = activityName;
      this.state.activityIcon = this.iconMap['activity_' + activityName];
    });
    console.log('[js] activitychange: ', activityName);
  }

  onProviderChange(provider:any) {
    this.zone.run(() => { this.state.provider = provider; });
    console.log('[js] providerchange: ', provider);
  }

  onGeofencesChange(event:any) {
    console.log('[js] geofenceschange: ', event);

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
    var circle = this.geofenceMarkers.find((marker) => {
      return marker.identifier === event.identifier;
    });
    if (!circle) { return; }

    // Change the color of activated geofence to light-grey.
    circle.activated = true;
    circle.setOptions({
      fillColor: COLORS.geofence_fill_color_activated,
      fillOpacity: 0.2,
      strokeColor: COLORS.geofence_stroke_color_activated,
      strokeOpacity: 0.4
    });
  }

  onHttpSuccess(response) {
    console.log('[js] http success: ', response);
  }

  onHttpFailure(response) {
    console.log('[js] http FAILURE: ', response);
  }

  setCenter(location) {
    this.updateCurrentLocationMarker(location);
    setTimeout(function() {
      this.map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
    }.bind(this));
  }

  updateCurrentLocationMarker(location) {
    var latlng = new google.maps.LatLng(location.coords.latitude, location.coords.longitude);
    this.currentLocationMarker.setPosition(latlng);
    this.locationAccuracyCircle.setCenter(latlng);
    this.locationAccuracyCircle.setRadius(location.coords.accuracy);

    if (this.lastLocation) {
      this.locationMarkers.push(this.buildLocationMarker(location));
    }
    if (location.sample === true) {
      return;
    }
    // Add breadcrumb to current Polyline path.
    this.polyline.getPath().push(latlng);
    this.polyline.setMap(this.map);
    this.lastLocation = location;
  }

  // Build a bread-crumb location marker.
  buildLocationMarker(location) {
    var icon = google.maps.SymbolPath.CIRCLE;
    var scale = 5;
    var anchor;

    if (!this.lastDirectionChangeLocation) {
      this.lastDirectionChangeLocation = location;
    }

    // Render an arrow marker if heading changes by 10 degrees or every 5 points.
    var deltaHeading = Math.abs(location.coords.heading - this.lastDirectionChangeLocation.coords.heading);
    if (deltaHeading >= 10 || !(this.locationMarkers.length % 5)) {
      icon = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
      scale = 3;
      anchor = new google.maps.Point(0, 2.6);
      this.lastDirectionChangeLocation = location;
    }

    return new google.maps.Marker({
      zIndex: 1,
      icon: {
        path: icon,
        rotation: location.coords.heading,
        scale: scale,
        anchor: anchor,
        fillColor: COLORS.marker_fill_color,
        fillOpacity: 1,
        strokeColor: COLORS.marker_stroke_color,
        strokeWeight: 1,
        strokeOpacity: 0.7
      },
      map: this.map,
      position: new google.maps.LatLng(location.coords.latitude, location.coords.longitude)
    });
  }

  buildGeofenceMarker(params) {
    // Add longpress event for adding GeoFence of hard-coded radius 200m.
    var geofence = new google.maps.Circle({
      identifier: params.identifier,
      zIndex: 100,
      fillColor: COLORS.geofence_fill_color,
      fillOpacity: 0.2,
      strokeColor: COLORS.geofence_stroke_color,
      strokeWeight: 2,
      strokeOpacity: 0.5,
      params: params,
      radius: parseInt(params.radius, 10),
      center: new google.maps.LatLng(params.latitude, params.longitude),
      map: this.map
    });
    // Add 'click' listener to geofence so we can edit it.
    google.maps.event.addListener(geofence, 'click', () => {
      //$scope.onShowGeofence(this.params);
      alert('show geofence modal');
    });
    return geofence;
  }

  showStationaryCircle(location:any) {
    //setCurrentLocationMarker(location);
    this.bgService.getState(function(state) {
      var coords = location.coords;
      var radius = (state.trackingMode === 'location' || state.trackingMode === 1) ? 200 : (state.geofenceProximityRadius / 2);
      var center = new google.maps.LatLng(coords.latitude, coords.longitude);

      this.stationaryRadiusCircle.setRadius(radius);
      this.stationaryRadiusCircle.setCenter(center);
      this.stationaryRadiusCircle.setMap(this.map);
      this.map.setCenter(center);
    }.bind(this));
  }

  hideStationaryCircle() {
    // Create a little red breadcrumb circle of our last stop-position
    var stopZone = new google.maps.Marker({
      zIndex: 1,
      map: this.map,
      position: this.stationaryRadiusCircle.getCenter(),
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: COLORS.stationary_geofence_fill_color,
        fillOpacity: 0.2,
        strokeColor: COLORS.stationary_geofence_stroke_color,
        strokeWeight: 1,
        strokeOpacity: 0.5
      }
    });
    var lastMarker = this.locationMarkers.pop();
    if (lastMarker) {
      lastMarker.setMap(null);
    }
    this.locationMarkers.push(stopZone);

    this.stationaryRadiusCircle.setMap(null);
  }

  clearMarkers() {
    // Clear location-markers.
    var marker;
    for (var n=0,len=this.locationMarkers.length;n<len;n++) {
      marker = this.locationMarkers[n];
      marker.setMap(null);
    }
    this.locationMarkers = [];

    // Clear geofence markers.
    for (var n=0,len=this.geofenceMarkers.length;n<len;n++) {
      marker = this.geofenceMarkers[n];
      marker.setMap(null);
    }
    this.geofenceMarkers = [];

    // Clear red stationaryRadius marker
    this.stationaryRadiusCircle.setMap(null);

    // Clear blue route PolyLine
    this.polyline.setMap(null);
    this.polyline.setPath([]);
  }
}
