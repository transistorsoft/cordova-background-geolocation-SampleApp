angular.module('starter.Home', [])

.controller('Home', function($scope, $ionicModal, $ionicLoading, $ionicPopup, $state, Settings, Data) {
  var PLAY_BUTTON_CLASS = "ion-play button-balanced",
      PAUSE_BUTTON_CLASS = "ion-pause button-assertive";

  Settings.onChange(function(name, value) {
    switch(name) {
      case 'showMapMarkers':
        onToggleShowMapMarkers(value);
        break;
    }
  });

  var icons = {
    activity_unknown: "ion-ios-help",
    activity_still: "ion-man",
    activity_shaking: "ion-android-walk",
    activity_on_foot: "ion-android-walk",
    activity_walking: "ion-android-walk",
    activity_running: "ion-android-walk",
    activity_on_bicycle: "ion-android-bicycle",
    activity_in_vehicle: "ion-android-car"
  };

  $scope.state = {
    enabled: false,
    isMoving: false,
    startButtonIcon: PLAY_BUTTON_CLASS,
    showMapMarkers: window.localStorage.getItem('settings:showMapMarkers') === 'true'
  };

  // Motion Activity
  $scope.activityIcon = icons.activity_still;
  $scope.activityName = "still";
  $scope.provider = {
    enabled: true,
    network: true,
    gps: true
  };

  /**
  * Show an alert
  * @param {String} title
  * @param {String} content
  */
  $scope.showAlert = function(title, content) {
    $ionicPopup.alert({
      title: title,
      content: content
    });
  };

  // Convenient, private reference to BackgroundGeolocation API
  var bgGeo, map;

  /**
  * @event BackgroundGeolocation location
  */
  function onLocation(location, taskId) {
    console.log('[js] location: ', location);
    centerOnMe(location);
    bgGeo.finish(taskId);
  }
  /**
  * @event BackgroundGeolocation location
  */
  function onLocationError(error) {
    console.error('[js] Location error: ', error);
  }
  /**
  * @event BackgroundGeolocation http
  */
  function onHttpSuccess(response) {
    console.info('[js] HTTP success', response);
  }
  /**
  * BackgroundGeolocation HTTP error
  */
  function onHttpError(error) {
    console.info('[js] HTTP ERROR: ', error);
  }
  /**
  * @event BackgroundGeolocation motionchange
  */
  function onMotionChange(isMoving, location, taskId) {
    console.log('[js] onMotionChange: ', isMoving, location);
    $scope.state.isMoving = isMoving;
    // Change state of start-button icon:  [>] or [||]
    $scope.$apply(function() {
      $scope.isChangingPace = false;
      $scope.state.startButtonIcon  = (isMoving) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;
    });

    if (map) {
      map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
      if (!isMoving) {
        setStationaryMarker(location);
      } else if (stationaryRadiusMarker) {
        setCurrentLocationMarker(location);
        stationaryRadiusMarker.setMap(null);
      }
    }
    bgGeo.finish(taskId);
  }
  /**
  * @event BackgroundGeolocation heartbeat
  */
  function onHeartbeat(params) {
    var shakes = params.shakes;
    var location = params.location;
    console.log('- heartbeat: ', params);

    var bgGeo = window.BackgroundGeolocation;

    /**
    * OPTIONAL.  retrieve current position during heartbeat callback
    *
    bgGeo.getCurrentPosition(function(location, taskId) {
      console.log("- location: ", location);
      bgGeo.finish(taskId);
    });
    *
    *
    */
  }
  /**
  * @event BackgroundGeolocation activitychange
  */
  function onActivityChange(activityName) {
    console.info('[js] Motion activity changed: ', activityName);
    var icon = icons['activity_' + activityName];
    if (!icon) {
      console.warn("Failed to find activity icon for: " + activityName);
      return;
    }
    console.log('- icon: ', icon);

    $scope.$apply(function() {
      $scope.activityName = activityName;
      $scope.activityIcon = icon;
    });
  }

  /**
  * @event BackgroundGeolocation providerchange
  */
  function onProviderChange(provider) {
    console.info('[js] Location provider change: ', JSON.stringify(provider));
    $scope.$apply(function() {
      $scope.provider.enabled = provider.enabled;
      $scope.provider.network = provider.network;
      $scope.provider.gps = provider.gps;

    });
  }
  /**
  * @event BackgroundGeolocation schedule
  */
  function onSchedule(state) {
    console.info('- Schedule event: ', state.enabled, state);

    $scope.$apply(function() {
      $scope.state.enabled = state.enabled;
      $scope.state.isMoving = false;
    });
  }
  /**
  * @event BackgroundGeolocation geofenceschange
  */
  function onGeofencesChange(event) {
    console.info('geofenceschange: ', event);
    var on = event.on;
    var off = event.off;

    // If neighter on or off, ALL geofences have been destroyed.  Remove all markers.
    if (!on.length && !off.length) {
      removeGeofenceMarkers();
      return;
    }
    for (var n=0,len=on.length;n<len;n++) {
      // only create markers if they're not already rendered
      if (!getGeofenceMarker(on[n].identifier)) {
        createGeofenceMarker(on[n]);
      }
    }
    for (var n=0,len=off.length;n<len;n++) {
      removeGeofence(off[n]);
    }
  }
  /**
  * @event BackgroundGeolocation geofence
  */
  function onGeofence(params, taskId) {
    console.log('- onGeofence: ', JSON.stringify(params, null, 2));

    var bgGeo = window.BackgroundGeolocation;
    //$scope.showAlert('Geofence ' + params.action, "Identifier: " + params.identifier);

    var marker  = getGeofenceMarker(params.identifier);

    if (!marker) {
      bgGeo.finish(taskId);
      return;
    }
    var geofence = marker.params;

    // Destroy the geofence?
    if (!geofence.notifyOnDwell || (geofence.notifyOnDwell && params.action === "DWELL")) {
      if (marker) {
        // Change the color of geofence marker to GREY so we know it has fired.
        marker.removed = true;
        marker.setOptions({
          fillColor: '#000000',
          fillOpacity: 0.3,
          strokeColor: '#000000',
          strokeOpacity: 0.5
        });
      }
    }
    bgGeo.finish(taskId);
  }

  /**
  * Configure the Google Map
  */
  function configureMap() {
    // Create map
    map = new google.maps.Map(document.getElementById("map"), {
      center: new google.maps.LatLng(43.07493,-89.381388),
      zoom: 16,
      zoomControl: false,
      panControl: false,
      streetViewControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Add custom LongPress event to google map so we can add Geofences with longpress event!
    new LongPress(map, 500);

    // "Add Geofence" cursor.
    geofenceCursor = new google.maps.Marker({
      map: map,
      clickable: false,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 100,
        fillColor: '#11b700',   //'2f71ff',
        fillOpacity: 0.2,
        strokeColor: '#11b700', // 2f71ff
        strokeWeight: 2,
        strokeOpacity: 0.9
      }
    });

    // Tap&hold detected.  Play a sound a draw a circular cursor.
    google.maps.event.addListener(map, 'longpresshold', function(e) {
      geofenceCursor.setPosition(e.latLng);
      geofenceCursor.setMap(map);
      bgGeo.playSound(Settings.getSoundId('LONG_PRESS_ACTIVATE'));
    });

    // Longpress cancelled.  Get rid of the circle cursor.
    google.maps.event.addListener(map, 'longpresscancel', function() {
      geofenceCursor.setMap(null);
      bgGeo.playSound(Settings.getSoundId('LONG_PRESS_CANCEL'));
    });

    // Longpress initiated, add the geofence
    google.maps.event.addListener(map, 'longpress', function(e) {
      onAddGeofence(geofenceCursor.getPosition());
      geofenceCursor.setMap(null);
    });
  }
  /**
  * Configure BackgroundGeolocation plugin
  */
  function configureBackgroundGeolocation() {
    var me = this;
    bgGeo = window.BackgroundGeolocation;
    var config = Settings.getConfig();

    // NOTE:  Optionally generate a schedule here.  @see /www/js/tests.js
    //  1: how many schedules?
    //  2: delay (minutes) from now to start generating schedules
    //  3: schedule duration (minutes)
    //  4: time between (minutes) generated schedule ON events
    //
    // UNCOMMENT TO AUTO-GENERATE A SERIES OF SCHEDULE EVENTS BASED UPON CURRENT TIME:
    //config.schedule = Tests.generateSchedule(24, 1, 1, 1);
    //
    //config.schedule = null;
    //config.url = 'http://192.168.11.100:8080/locations';
    config.params = {};

    // Attach Device info to BackgroundGeolocation params.device
    config.params.device = ionic.Platform.device();

    bgGeo.on('location', onLocation, onLocationError);
    bgGeo.on('motionchange', onMotionChange);
    bgGeo.on('geofence', onGeofence);
    bgGeo.on('http', onHttpSuccess, onHttpError);
    bgGeo.on('heartbeat', onHeartbeat);
    bgGeo.on('schedule', onSchedule);
    bgGeo.on('activitychange', onActivityChange);
    bgGeo.on('providerchange', onProviderChange);
    bgGeo.on('geofenceschange', onGeofencesChange);

    bgGeo.configure(config, function(state) {
      console.log('state.schedule: ', state.schedule);

      // If configured with a Schedule, start it:
      if (state.schedule) {
        bgGeo.startSchedule(function() {
          console.log('[js] Start schedule success');
        }, function(error) {
          console.warn('- FAILED TO START SCHEDULE: ', error);
        });
      }

      $scope.$apply(function() {
        $scope.state.enabled = state.enabled;
        $scope.state.isMoving = state.isMoving;
      });
    });
  }

  function configureBackgroundFetch() {
    var config = Settings.getConfig();
    var Fetcher = window.BackgroundFetch;
    // Your background-fetch handler.
    var fetchCallback = function() {
        console.log('[js] BackgroundFetch initiated');
        Fetcher.finish();
    }

    var failureCallback = function() {
        console.log('- BackgroundFetch failed');
    };

    Fetcher.configure(fetchCallback, failureCallback, {
        stopOnTerminate: config.stopOnTerminate
    });
  }
  /**
  * Platform is ready.  Boot the Home screen
  */
  function onPlatformReady() {
    configureMap();
    // Configure BackgroundGeolocation
    if (!window.BackgroundGeolocation) {
      console.warn('Could not detect BackgroundGeolocation API');
      return;
    }
    if (window.BackgroundFetch) {
      configureBackgroundFetch();
    }
    configureBackgroundGeolocation();
  }

  // Build "Add Geofence" Modal.
  $ionicModal.fromTemplateUrl('js/app/home/add-geofence.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.addGeofenceModal = modal;
  });

  // Build "Show Geofence" Modal.
  $ionicModal.fromTemplateUrl('js/app/home/show-geofence.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.showGeofenceModal = modal;
  });

  function onAddGeofence(latLng) {
    $scope.geofenceRecord = {
      latitude: latLng.lat(),
      longitude: latLng.lng(),
      identifier: '',
      radius: 200,
      notifyOnEntry: true,
      notifyOnExit: false,
      notifyOnDwell: false,
      loiteringDelay: undefined
    };
    $scope.addGeofenceModal.show();
  }

  /**
  * Create geofence click-handler
  */
  $scope.onCreateGeofence = function() {
    $scope.addGeofenceModal.hide();
    bgGeo.addGeofences([$scope.geofenceRecord], function() {
      bgGeo.playSound(Settings.getSoundId('ADD_GEOFENCE'));
      createGeofenceMarker($scope.geofenceRecord);
    }, function(error) {
      console.error(error);
      alert("Failed to add geofence: " + error);
    });
  };
  /**
  * Cancel geofence modal
  */
  $scope.onCancelGeofence = function() {
    bgGeo.playSound(Settings.getSoundId('LONG_PRESS_ACTIVATE'));
    $scope.modal.hide();
  };
  /**
  * show geofence modal
  * @param {Google.maps.Circle} circle
  */
  $scope.onShowGeofence = function(params) {
    bgGeo.playSound(Settings.getSoundId("LONG_PRESS_ACTIVATE"));
    $scope.geofenceRecord = params;
    $scope.showGeofenceModal.show();
  };
  /**
  * Remove geofence click-handler
  */
  $scope.onRemoveGeofence = function() {
    var identifier = $scope.geofenceRecord.identifier;
    bgGeo.removeGeofence(identifier);
    removeGeofence(identifier);
    $scope.showGeofenceModal.hide();
  };
  /**
  * Create google.maps.Circle geofence marker.
  * @param {Object}
  */
  var geofenceMarkers = [];
  var createGeofenceMarker = function(params) {
    // Add longpress event for adding GeoFence of hard-coded radius 200m.
    var geofence = new google.maps.Circle({
      zIndex: 100,
      fillColor: '#11b700',
      fillOpacity: 0.2,
      strokeColor: '#11b700',
      strokeWeight: 2,
      strokeOpacity: 0.9,
      params: params,
      radius: parseInt(params.radius, 10),
      center: new google.maps.LatLng(params.latitude, params.longitude),
      map: map
    });
    // Add 'click' listener to geofence so we can edit it.
    google.maps.event.addListener(geofence, 'click', function() {
      $scope.onShowGeofence(this.params);
    });
    geofenceMarkers.push(geofence);
    return geofence;
  };
  /**
  * Remove all geofence markers
  */
  var removeGeofenceMarkers = function() {
    for (var n=0,len=geofenceMarkers.length;n<len;n++) {
      marker = geofenceMarkers[n];
      marker.setMap(null);
    }
    geofenceMarkers = [];
  };

  /**
  * Fetch a google.maps.Circle marker
  */
  var getGeofenceMarker = function(identifier) {
    var index = geofenceMarkers.map(function(geofence) { return geofence.params.identifier; }).indexOf(identifier);
    if (index >= 0) {
      return geofenceMarkers[index];
    }
    return null;
  };
  /**
  * Remove a geofence
  */
  var removeGeofence = function(identifier) {
    var marker = getGeofenceMarker(identifier);
    if (marker) {
      var index = geofenceMarkers.indexOf(marker);
      geofenceMarkers.splice(index, 1);
      marker.setMap(null);
      if (marker.removed) {
        return;
      }
    }
  };

  var onToggleShowMapMarkers = function(value) {
    $scope.state.showMapMarkers = value;

    // Clear location-markers.
    var marker;
    for (var n=0,len=markers.length;n<len;n++) {
      marker = markers[n];
      marker.setMap((value) ? map : null);
    }
  };

  var currentLocation,
      lastLocation,
      currentLocationMarker, locationAccuracyMarker, polyline,
      markers = [], geofenceMarkers = [];
  /**
  * Create current position Marker
  */
  function setCurrentLocationMarker(location) {
    // Set currentLocation @property
    currentLocation = location;
    var coords = location.coords;

    if (!currentLocationMarker) {
      currentLocationMarker = new google.maps.Marker({
        map: map,
        zIndex: 10,
        title: 'Current Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#2677FF',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeOpacity: 1,
          strokeWeight: 6
        }
      });
      locationAccuracyMarker = new google.maps.Circle({
        zIndex: 9,
        fillColor: '#3366cc',
        fillOpacity: 0.4,
        strokeOpacity: 0,
        map: map
      });
    }

    if (!polyline) {
      polyline = new google.maps.Polyline({
        zIndex: 1,
        map: map,
        geodesic: true,
        strokeColor: '#2677FF',
        strokeOpacity: 0.7,
        strokeWeight: 5
      });
    }
    var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);

    if (lastLocation && $scope.state.showMapMarkers) {
      var last = lastLocation;
      // Drop a breadcrumb of where we've been.
      var icon, scale, anchor;
      if (markers.length % 2) {
        icon = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
        scale = 4;
        anchor = new google.maps.Point(0, 2.6);
      } else {
        icon = google.maps.SymbolPath.CIRCLE;
        scale = 6;
      }

      markers.push(new google.maps.Marker({
        zIndex: 1,
        icon: {
          path: icon,
          rotation: last.coords.heading,
          scale: scale,
          anchor: anchor,
          fillColor: '#11b700',//'26cc77',
          fillOpacity: 1,
          strokeColor: '#0d6104',
          strokeWeight: 1,
          strokeOpacity: 0.7
        },
        map: map,
        position: new google.maps.LatLng(lastLocation.coords.latitude, lastLocation.coords.longitude)
      }));
    }

    // Update our current position marker and accuracy bubble.
    currentLocationMarker.setPosition(latlng);
    locationAccuracyMarker.setCenter(latlng);
    locationAccuracyMarker.setRadius(location.coords.accuracy);

    if (location.sample === true) {
      return;
    }

    // Add breadcrumb to current Polyline path.
    polyline.getPath().push(latlng);
    lastLocation = location;

    $scope.$apply(function() {
      $scope.odometer = (location.odometer/1000).toFixed(1);
    });
  };

  /**
  * Red stationary-radius marker
  */
  var stationaryRadiusMarker;
  function setStationaryMarker(location) {
    setCurrentLocationMarker(location);

    var coords = location.coords;

    if (!stationaryRadiusMarker) {
      stationaryRadiusMarker = new google.maps.Circle({
        zIndex: 0,
        fillColor: '#ff0000',
        strokeColor: '#aa0000',
        strokeWeight: 2,
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
        map: map
      });
    }
    var radius = 50;
    var center = new google.maps.LatLng(coords.latitude, coords.longitude);
    stationaryRadiusMarker.setRadius(radius);
    stationaryRadiusMarker.setCenter(center);
    stationaryRadiusMarker.setMap(map);
    map.setCenter(center);
  };

  /**
  * Center users's current position on Map
  */
  function centerOnMe(location) {
    map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
    setCurrentLocationMarker(location);
  };

	// Add BackgroundGeolocationService event-listeners when Platform is ready.
  ionic.Platform.ready(onPlatformReady);

  /**
  * Stop / Start BackgroundGeolocation tracking button handler.
  */
  $scope.onToggleEnabled = function() {
    if (!bgGeo) { return;}
    if ($scope.state.enabled) {

      bgGeo.start(function(state) {
        console.log('[js] BackgroundGeolocation started', state);

        // If BackgroundGeolocation is monitoring geofences, fetch them and add map-markers
        /*
        bgGeo.getGeofences(function(rs) {
          for (var n=0,len=rs.length;n<len;n++) {
            createGeofenceMarker(rs[n]);
          }
        });
        */
      }, function(error) {
        console.warn(error);
      });
    } else {
      bgGeo.stop(function() {
        console.info('[js] BackgroundGeolocation stopped');
      });

      // Reset the odometer.
      bgGeo.resetOdometer(function() {
        $scope.$apply(function() {
          $scope.odometer = 0;
        });
      });

      // Clear map markers
      bgGeo.playSound(Settings.getSoundId('BUTTON_CLICK'));
      $scope.state.isMoving = false;
      $scope.state.startButtonIcon = PLAY_BUTTON_CLASS;

      // Clear previousLocation
      lastLocation = undefined;

      // Clear location-markers.
      var marker;
      for (var n=0,len=markers.length;n<len;n++) {
        marker = markers[n];
        marker.setMap(null);
      }
      markers = [];

      // Clear geofence markers.
      for (var n=0,len=geofenceMarkers.length;n<len;n++) {
        marker = geofenceMarkers[n];
        marker.setMap(null);
      }
      geofenceMarkers = [];

      // Clear red stationaryRadius marker
      if (stationaryRadiusMarker) {
        stationaryRadiusMarker.setMap(null);
        stationaryRadiusMarker = null;
      }

      // Clear blue route PolyLine
      if (polyline) {
        polyline.setMap(null);
        polyline = undefined;
      }
    }
  }

  /**
  * getCurrentPosition button handler
  */
  $scope.getCurrentPosition = function() {
    if (!bgGeo) { return; }

    bgGeo.getCurrentPosition(function(location, taskId) {
      console.info('[js] getCurrentPosition: ', JSON.stringify(location));
      centerOnMe(location);
      bgGeo.finish(taskId);
    }, function(error) {
      console.error('[js] getCurrentPosition error: ', error);
    }, {
      timeout: 30,
      samples: 3,
      desiredAccuracy: 0,
      //maximumAge: 5000,
      persist: true,
      extras: {
        'extra-param': 'getCurrentPosition'
      }
    })
  }

  $scope.isChangingPace = false;
  $scope.onClickChangePace = function() {
    var willStart = !$scope.state.isMoving;
    console.log('onClickStart: ', willStart);
    $scope.isChangingPace = true;

    bgGeo.changePace(willStart, function(location) {
      console.log("[js] changePace success: ", location);
      $scope.$apply(function() {
        $scope.isChangingPace = false;
        $scope.state.isMoving    = willStart;
        $scope.state.startButtonIcon  = (willStart) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;
      });
    }, function(error) {
      console.error("[js] changePace failed with error: " + error);
      $scope.$apply(function() {
        $scope.isChangingPace = false;
      });
    });
  };
  /**
  * Show Settings screen button handler
  */
  $scope.onClickSettings = function() {
    if (bgGeo) {
      bgGeo.playSound(Settings.getSoundId('BUTTON_CLICK'));
    }
    $state.transitionTo('settings');
  };

});
