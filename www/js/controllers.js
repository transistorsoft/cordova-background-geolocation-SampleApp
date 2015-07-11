
angular.module('starter.controllers', [])

/**
* Maps Controller
*/
.controller('Maps', function($scope, $ionicModal, $ionicLoading, $ionicPopup, $state) {
  var PLAY_BUTTON_CLASS = "ion-play button-balanced",
      PAUSE_BUTTON_CLASS = "ion-pause button-assertive";

  // Add BackgroundGeolocation event-listeners when Platform is ready.
  ionic.Platform.ready(function() {
    BackgroundGeolocationService.onLocation($scope.setCurrentLocationMarker);
    BackgroundGeolocationService.onMotionChange($scope.onMotionChange);
    BackgroundGeolocationService.onGeofence($scope.onGeofence);
  });

  /**
  * BackgroundGelocation plugin state
  */
  $scope.bgGeo = {
    enabled: window.localStorage.getItem('bgGeo:enabled') == 'true',
    started: window.localStorage.getItem('bgGeo:started') == 'true'
  };
  $scope.startButtonIcon = ($scope.bgGeo.started) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;
  $scope.map                    = undefined;
  $scope.currentLocationMarker  = undefined;
  $scope.previousLocation       = undefined;
  $scope.locationMarkers        = [];
  $scope.geofenceMarkers        = [];
  $scope.path                   = undefined;
  $scope.currentLocationMarker  = undefined;
  $scope.locationAccuracyMarker = undefined;
  $scope.stationaryRadiusMarker = undefined;

  $scope.odometer = 0;

  // Build Add Geofence Modal.
  $ionicModal.fromTemplateUrl('templates/geofences/add.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.addGeofenceModal = modal;
  });

  // Build Add Geofence Modal.
  $ionicModal.fromTemplateUrl('templates/geofences/show.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.showGeofenceModal = modal;
  });

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

  $scope.mapCreated = function(map) {
    $scope.map = map;
    
    // Add custom LongPress event to google map so we can add Geofences with longpress event!
    new LongPress(map, 500);

    // Draw a red circle around the Marker we wish to move.
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
      BackgroundGeolocationService.playSound('LONG_PRESS_ACTIVATE')
    });

    // Longpress cancelled.  Get rid of the circle cursor.
    google.maps.event.addListener(map, 'longpresscancel', function() {
      geofenceCursor.setMap(null);
      BackgroundGeolocationService.playSound('LONG_PRESS_CANCEL');
    });

    // Longpress initiated, add the geofence
    google.maps.event.addListener(map, 'longpress', function(e) {
      $scope.onAddGeofence(geofenceCursor.getPosition());
      geofenceCursor.setMap(null);
    });

    // Add BackgroundGeolocationService event-listeners when Platform is ready.
    ionic.Platform.ready(function() {
      var bgGeo = BackgroundGeolocationService.getPlugin();
      if (!bgGeo) { return; }
      bgGeo.getGeofences(function(rs) {
        for (var n=0,len=rs.length;n<len;n++) {
          createGeofenceMarker(rs[n]);
        }
      });
      $scope.centerOnMe();
    });
  };

  $scope.onMotionChange = function(isMoving, location, taskId) {
    console.log('[js] onMotionChange: ', isMoving, JSON.stringify(location));
    $scope.showAlert('onMotionChange', 'isMoving: ' + isMoving);

    if ($scope.map) {
      $scope.map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
      if (!isMoving) {
        $scope.setStationaryMarker(location);
      } else if ($scope.stationaryRadiusMarker) {
        $scope.setCurrentLocationMarker(location);
        $scope.stationaryRadiusMarker.setMap(null);
      }

    }
    BackgroundGeolocationService.finish(taskId); 
  }
  /**
  * Draw google map marker for current location
  */
  $scope.setCurrentLocationMarker = function(location) {
    var plugin = BackgroundGeolocationService.getPlugin();
    if (plugin) {
      // Update odometer
      plugin.getOdometer(function(value) {
        $scope.$apply(function() {
          $scope.odometer = (value/1000).toFixed(1);
        });
      });
    }
    // Set currentLocation @property
    $scope.currentLocation = location;
    
    var coords = location.coords;

    if (!$scope.currentLocationMarker) {
      $scope.currentLocationMarker = new google.maps.Marker({
        map: $scope.map,
        zIndex: 10,
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
      $scope.locationAccuracyMarker = new google.maps.Circle({
        zIndex: 9,
        fillColor: '#3366cc',
        fillOpacity: 0.4,
        strokeOpacity: 0,
        map: $scope.map
      });
    }
    if (!$scope.bgGeo.enabled) {
      return;
    }
    if (!$scope.path) {
      $scope.path = new google.maps.Polyline({
        zIndex: 1,
        map: $scope.map,
        geodesic: true,
        strokeColor: '#2677FF',
        strokeOpacity: 0.7,
        strokeWeight: 5
      });
    }
    var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);
    
    if ($scope.previousLocation) {
      var prevLocation = $scope.previousLocation;
      // Drop a breadcrumb of where we've been.
      $scope.locationMarkers.push(new google.maps.Marker({
        zIndex: 1,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#11b700',//'26cc77',
          fillOpacity: 1,
          strokeColor: '#0d6104',
          strokeWeight: 1,
          strokeOpacity: 0.7
        },
        map: $scope.map,
        position: new google.maps.LatLng(prevLocation.coords.latitude, prevLocation.coords.longitude)
      }));
    }

    // Update our current position marker and accuracy bubble.
    $scope.currentLocationMarker.setPosition(latlng);
    $scope.locationAccuracyMarker.setCenter(latlng);
    $scope.locationAccuracyMarker.setRadius(location.coords.accuracy);

    // Add breadcrumb to current Polyline path.
    $scope.path.getPath().push(latlng);
    $scope.previousLocation = location;
  };

  /**
  * Draw red stationary-circle on google map
  */
  $scope.setStationaryMarker = function(location) {
    console.log('[js] BackgroundGeoLocation onStationary ' + JSON.stringify(location));
    $scope.setCurrentLocationMarker(location);

    var coords = location.coords;
    
    if (!$scope.stationaryRadiusMarker) {
      $scope.stationaryRadiusMarker = new google.maps.Circle({
        zIndex: 0,
        fillColor: '#ff0000',
        strokeColor: '#aa0000',
        strokeWeight: 2,
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
        map: $scope.map
      });
    }
    var radius = 50;
    var center = new google.maps.LatLng(coords.latitude, coords.longitude);
    $scope.stationaryRadiusMarker.setRadius(radius);
    $scope.stationaryRadiusMarker.setCenter(center);
    $scope.stationaryRadiusMarker.setMap($scope.map);
    $scope.map.setCenter(center);
  };

  /**
  * Enable BackgroundGeolocationService
  */
  $scope.onToggleEnabled = function() {
    var isEnabled = $scope.bgGeo.enabled;
    console.log('onToggleEnabled: ', isEnabled);
    BackgroundGeolocationService.setEnabled(isEnabled, function() {
      if (isEnabled) {
        $scope.centerOnMe();
      }
    });

    if (!isEnabled) {
      // Reset odometer to 0.
      var plugin = BackgroundGeolocationService.getPlugin();
      if (plugin) {
        plugin.resetOdometer(function() {
          $scope.$apply(function() {
            $scope.odometer = 0;
          });
        });
      }
      BackgroundGeolocationService.playSound('BUTTON_CLICK');
      $scope.bgGeo.started = false;
      $scope.startButtonIcon = PLAY_BUTTON_CLASS;
      
      // Clear previousLocation
      $scope.previousLocation = undefined;

      // Clear location-markers.
      var marker;
      for (var n=0,len=$scope.locationMarkers.length;n<len;n++) {
        marker = $scope.locationMarkers[n];
        marker.setMap(null);
      }
      $scope.locationMarkers = [];

      // Clear geofence markers.
      for (var n=0,len=$scope.geofenceMarkers.length;n<len;n++) {
        marker = $scope.geofenceMarkers[n];
        marker.setMap(null);
      }
      $scope.geofenceMarkers = [];

      
      // Clear red stationaryRadius marker
      if ($scope.stationaryRadiusMarker) {
        $scope.stationaryRadiusMarker.setMap(null);
      }

      // Clear blue route PolyLine
      if ($scope.path) {
        $scope.path.setMap(null);
        $scope.path = undefined;
      }
    }
  };
  /**
  * Start/stop aggressive monitoring / stationary mode
  */
  $scope.onClickStart = function() {
    var willStart = !$scope.bgGeo.started;
    console.log('onClickStart: ', willStart);
    $scope.bgGeo.started    = willStart;
    $scope.startButtonIcon  = (willStart) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;

    BackgroundGeolocationService.setPace(willStart);
  };
  /**
  * Show Settings screen
  */
  $scope.onClickSettings = function() {
    BackgroundGeolocationService.playSound('BUTTON_CLICK');
    $state.transitionTo('settings');
  };
  /**
  * Center map button
  */
  $scope.centerOnMe = function () {
    if (!$scope.map) {
      return;
    }

    BackgroundGeolocationService.getCurrentPosition(function(location, taskId) {
      $scope.map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
      $scope.setCurrentLocationMarker(location);
      BackgroundGeolocationService.finish(taskId);
    }, function(error) {
      console.error("- getCurrentPostion failed: ", error);
    });
  };

  /**
  * Geofence features
  */
  $scope.geofenceRecord = {};

  /**
  * Geofence event-handler from plugin
  */
  $scope.onGeofence = function(params, taskId) {
    $scope.showAlert('Geofence ' + params.action, "Identifier: " + params.identifier);
    
    var bgGeo = BackgroundGeolocationService.getPlugin();
    // Remove geofence after it triggers.
    bgGeo.removeGeofence(params.identifier, function() {
      // We're inside a nested async callback here, which has now completed.  #finish the outer #onGeofence taskId now.
      bgGeo.finish(taskId);
      var marker = getGeofenceMarker(params.identifier);
      // Grey-out the google.maps.Circle to show it's been triggered.
      if (marker) {
        marker.removed = true;
        marker.setOptions({
          fillColor: '#000000',
          fillOpacity: 0.3,
          strokeColor: '#000000',
          strokeOpacity: 0.5
        });
      }
    }, function(error) {
      console.log('Failed to remove geofence: ' + error);
      // Finish outer #onGeofence taskId now.
      bgGeo.finish(taskId);
    });
  };
  /**
  * Add geofence click-handler
  */
  $scope.onAddGeofence = function(latLng) {
    $scope.geofenceRecord = {
      latitude: latLng.lat(),
      longitude: latLng.lng(),
      identifier: '',
      radius: 200,
      notifyOnEntry: true,
      notifyOnExit: false
    };
    $scope.addGeofenceModal.show();
  };
  /**
  * Create geofence click-handler
  */
  $scope.onCreateGeofence = function() {
    $scope.addGeofenceModal.hide();
    BackgroundGeolocationService.addGeofence($scope.geofenceRecord, function() {
      createGeofenceMarker($scope.geofenceRecord);
    });
  };
  /**
  * Cancel geofence modal
  */
  $scope.onCancelGeofence = function() {
    BackgroundGeolocationService.playSound('LONG_PRESS_ACTIVATE');
    $scope.modal.hide();
  };
  /**
  * show geofence modal
  * @param {Google.maps.Circle} circle
  */
  $scope.onShowGeofence = function(params) {
    BackgroundGeolocationService.playSound("LONG_PRESS_ACTIVATE");
    $scope.geofenceRecord = params;
    $scope.showGeofenceModal.show();
  };
  /**
  * Remove geofence click-handler
  */
  $scope.onRemoveGeofence = function() {
    var identifier = $scope.geofenceRecord.identifier;
    removeGeofence(identifier);
    $scope.showGeofenceModal.hide();
  };
  /**
  * Create google.maps.Circle geofence marker.
  * @param {Object}
  */
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
      map: $scope.map
    });
    // Add 'click' listener to geofence so we can edit it.
    google.maps.event.addListener(geofence, 'click', function() {
      $scope.onShowGeofence(this.params);
    });
    $scope.geofenceMarkers.push(geofence);
    return geofence;
  };
  /**
  * Fetch a google.maps.Circle marker
  */
  var getGeofenceMarker = function(identifier) {
    var index = $scope.geofenceMarkers.map(function(geofence) { return geofence.params.identifier; }).indexOf(identifier);
    if (index >= 0) {
      return $scope.geofenceMarkers[index];
    }
    return -1;
  };
  /**
  * Remove a geofence
  */
  var removeGeofence = function(identifier) {
    var marker = getGeofenceMarker(identifier);
    if (marker) {
      var index = $scope.geofenceMarkers.indexOf(marker);
      $scope.geofenceMarkers.splice(index, 1);
      marker.setMap(null);
      if (marker.removed) {
        return;
      }
    }
    BackgroundGeolocationService.removeGeofence(identifier);
  };
})

/**
* Settings Controller
*/
.controller('Settings', function($scope, $state) {
  $scope.syncButtonIcon = 'ion-load-c icon-animated';

  $scope.selectedValue = '';
  $scope.isSyncing = false;
  $scope.isAutoSyncDisabled = function() {
    return !$scope.isSyncing && BackgroundGeolocationService.getConfig().autoSync == 'true';
  }

  $scope.onClickSync = function() {
    if ($scope.isSyncing) { return false; }

    BackgroundGeolocationService.playSound('BUTTON_CLICK');
    $scope.isSyncing = true;
    BackgroundGeolocationService.sync(function(rs, taskId) {
      BackgroundGeolocationService.playSound('MESSAGE_SENT');
      $scope.$apply(function() {
        $scope.isSyncing = false;
      });
      BackgroundGeolocationService.finish(taskId);
    }, function(error) {
      console.warn('- sync error: ', error);
      $scope.$apply(function() {
        $scope.isSyncing = false;
      })
    });
  };

  $scope.getSettings = function(group) {
    return BackgroundGeolocationService.getSettings(group);
  };

  $scope.getValue = function(name) {
    if (name === 'triggerActivities') {
      var value = BackgroundGeolocationService.getConfig()[name];
      var items = value.replace(/\s+/g, '').split(',');
      if (items.length == 5) {
        return 'ALL';
      } else {
        return value;
      }
    } else {
      return BackgroundGeolocationService.getConfig()[name];
    }
  };

  $scope.getConfig = function() {
    return BackgroundGeolocationService.getConfig();
  };

  $scope.getSettingValues = function() {
    return $state.selectedSetting.values;
  };

  $scope.getSelectedSetting = function() {
    return $state.selectedSetting;
  };

  $scope.getTriggerActivities = function() {
    return $state.triggerActivities;
  };

  /**
  * Row-click handler
  */
  $scope.onSelectSetting = function() {
    $state.selectedSetting = this.setting;
    BackgroundGeolocationService.playSound('BUTTON_CLICK');

    if (this.setting.name === 'triggerActivities') {
    }
    switch (this.setting.name) {
      case 'triggerActivities':
        $state.triggerActivities = {};
        var activities = $scope.getConfig().triggerActivities.replace(/\s+/g, '').split(',');
        var activity;
        for (var n=0,len=activities.length;n<len;n++) {
          activity = activities[n];
          $state.triggerActivities[activity] = true;
        }
        break;
    }
    switch (this.setting.inputType) {
      case 'select':
      case 'text':
        $state.go('settings/' + this.setting.name);
        break;
    }
    
  };

  
  /**
  * Select setting-value
  */
  $scope.onSelectValue = function() {
    BackgroundGeolocationService.playSound('BUTTON_CLICK');
    BackgroundGeolocationService.set($state.selectedSetting.name, this.value);
    $state.autoSyncDisabled = !BackgroundGeolocationService.getConfig().autoSync;
    $state.go('settings');
  };

  $scope.onClickDone = function() {

    //BackgroundGeolocationService.set($state.selectedSetting.name, this.value);
    var config  = this.getConfig();
    var name    = $state.selectedSetting.name;
    var value   = config[name];

    switch (name) {
      case 'triggerActivities':
        var model = $state.triggerActivities;
        value = Object.keys(model).filter(function(key) {
          return (key.length > 0) && (model[key] === true);
        });
        value = value.length ? value.join(',') : '';
        break;      
    }
    BackgroundGeolocationService.set(name, value);
    $state.go('settings');
  };

  /**
  * List of available settings
  */
  $scope.settings = BackgroundGeolocationService.getSettings();
});
