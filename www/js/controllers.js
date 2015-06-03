
angular.module('starter.controllers', [])

/**
* Maps Controller
*/
.controller('Maps', function($scope, $ionicModal, $ionicLoading, $ionicPopup, $state) {
  var PLAY_BUTTON_CLASS = "ion-play button-balanced",
      PAUSE_BUTTON_CLASS = "ion-pause button-assertive";

  ionic.Platform.ready(function() {
    var bgGeo = BackgroundGeolocation.getPlugin();
    if (bgGeo) {
      bgGeo.getGeofences(function(rs) {
        for (var n=0,len=rs.length;n<len;n++) {
          createGeofence(rs[n]);
        }
      });
    }

    BackgroundGeolocation.onLocation($scope.setCurrentLocationMarker);
    BackgroundGeolocation.onStationary($scope.setStationaryMarker);
    BackgroundGeolocation.onGeofence(function(params) {
      $scope.showAlert('Geofence ' + params.action, "Identifier: " + params.identifier);
      if (bgGeo) {
        bgGeo.removeGeofence(identifier, function() {
          var marker = getGeofenceMarker(identifier);
          if (marker) {
            marker.removed = true;
            marker.setOptions({
              fillColor: '#000000',
              fillOpacity: 0.4,
              strokeColor: '#000000',
              strokeOpacity: 0.6
            });
          }
        });
      }
    });
  });

  $scope.map                    = undefined;
  $scope.currentLocation        = undefined;
  $scope.previousLocation       = undefined;
  $scope.markers                = [];
  $scope.geofences              = [];
  $scope.path                   = undefined;
  $scope.currentLocationMarker  = undefined;
  $scope.locationAccuracyMarker = undefined;
  $scope.stationaryRadius       = undefined;

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

  // Listen to geofence events.  Remove geofence after a crossing-event occurs.
  ionic.Platform.ready(function() {
    var bgGeo = BackgroundGeolocation.getPlugin();
    if (bgGeo) {
      
    }
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
        zIndex: 0,
        clickable: false,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 100,
            strokeColor: 'green',
            strokeWeight: 2
        }
    });

    // Tap&hold detected.  Play a sound a draw a circular cursor.
    google.maps.event.addListener(map, 'longpresshold', function(e) {      
      geofenceCursor.setPosition(e.latLng);
      geofenceCursor.setMap(map);
      BackgroundGeolocation.playSound('LONG_PRESS_ACTIVATE')
    });

    // Longpress cancelled.  Get rid of the circle cursor.
    google.maps.event.addListener(map, 'longpresscancel', function() {
      geofenceCursor.setMap(null);
      BackgroundGeolocation.playSound('LONG_PRESS_CANCEL');
    });

    // Longpress initiated, add the geofence
    google.maps.event.addListener(map, 'longpress', function(e) {
      $scope.onAddGeofence(geofenceCursor.getPosition());
      geofenceCursor.setMap(null);
    });
  };

  /**
  * Draw google map marker for current location
  */
  $scope.setCurrentLocationMarker = function(location) {
    var plugin = BackgroundGeolocation.getPlugin();
    if (plugin) {
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
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 3,
          fillColor: 'blue',
          strokeColor: 'blue',
          strokeWeight: 5
        }
      });
      $scope.locationAccuracyMarker = new google.maps.Circle({
        fillColor: '#3366cc',
        fillOpacity: 0.4,
        strokeOpacity: 0,
        map: $scope.map
      });
    }
    if (!$scope.path) {
      $scope.path = new google.maps.Polyline({
        map: $scope.map,
        strokeColor: '#3366cc',
        fillOpacity: 0.4
      });
    }
    var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);
    
    
    if ($scope.previousLocation) {
      var prevLocation = $scope.previousLocation;
      // Drop a breadcrumb of where we've been.
      $scope.markers.push(new google.maps.Marker({
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 3,
          fillColor: 'green',
          strokeColor: 'green',
          strokeWeight: 5
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
  $scope.setStationaryMarker = function(location, taskId) {
    console.log('[js] BackgroundGeoLocation onStationary ' + JSON.stringify(location));
    $scope.setCurrentLocationMarker(location);

    var coords = location.coords;
    
    if (!$scope.stationaryRadius) {
      $scope.stationaryRadius = new google.maps.Circle({
        fillColor: '#cc0000',
        fillOpacity: 0.4,
        strokeOpacity: 0,
        map: $scope.map
      });
    }
    var radius = 50;
    var center = new google.maps.LatLng(coords.latitude, coords.longitude);
    $scope.stationaryRadius.setRadius(radius);
    $scope.stationaryRadius.setCenter(center);

    $scope.map.setCenter(center);
  };

  /**
  * BackgroundGelocation plugin state
  */
  $scope.bgGeo = {
    enabled: window.localStorage.getItem('bgGeo:enabled') == 'true',
    started: window.localStorage.getItem('bgGeo:started') == 'true'
  };

  $scope.startButtonIcon = ($scope.bgGeo.started) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;

  /**
  * Enable BackgroundGeolocation
  */
  $scope.onClickEnable = function() {
    var willEnable = $scope.bgGeo.enabled;
    console.log('onClickEnable: ', willEnable);
    BackgroundGeolocation.setEnabled(willEnable);
    if (willEnable) {

    } else {
      BackgroundGeolocation.playSound('BUTTON_CLICK');
      $scope.bgGeo.started = false;
      $scope.startButtonIcon = PLAY_BUTTON_CLASS;
    }
  }
  /**
  * Start/stop aggressive monitoring / stationary mode
  */
  $scope.onClickStart = function() {
    var willStart = !$scope.bgGeo.started;
    console.log('onClickStart: ', willStart);
    $scope.bgGeo.started    = willStart;
    $scope.startButtonIcon  = (willStart) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;

    BackgroundGeolocation.setPace(willStart);
  };
  /**
  * Show Settings screen
  */
  $scope.onClickSettings = function() {
    BackgroundGeolocation.playSound('BUTTON_CLICK');
    $state.transitionTo('settings');
  };
  /**
  * Center map button
  */
  $scope.centerOnMe = function () {
    BackgroundGeolocation.playSound('BUTTON_CLICK');
    if (!$scope.map) {
      return;
    }

    $scope.loading = $ionicLoading.show({
      content: 'Getting current location...',
      showBackdrop: false
    });

    navigator.geolocation.getCurrentPosition(function (pos) {
      console.log('Got pos', pos);
      $scope.setCurrentLocationMarker(pos);
      $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
      $scope.loading.hide();
    }, function (error) {
      alert('Unable to get location: ' + error.message);
    });
  };

  /**
  * Geofence features
  */
  $scope.geofenceRecord = {};

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
  $scope.onCreateGeofence = function() {
    $scope.addGeofenceModal.hide();
    BackgroundGeolocation.addGeofence($scope.geofenceRecord, function() {
      createGeofence($scope.geofenceRecord);
    });
  };

  /**
  * show geofence modal
  * @param {Google.maps.Circle} circle
  */
  $scope.onShowGeofence = function(params) {
    $scope.geofenceRecord = params;
    $scope.showGeofenceModal.show();
  };

  $scope.onRemoveGeofence = function() {    
    var identifier = $scope.geofenceRecord.identifier;
    removeGeofence(identifier);
    $scope.showGeofenceModal.hide();
  };

  var createGeofence = function(params) {
    // Add longpress event for adding GeoFence of hard-coded radius 200m.
    var geofence = new google.maps.Circle({
      fillColor: '#33cc66',
      fillOpacity: 0.4,
      strokeColor: '#33cc66',
      params: params,
      radius: parseInt(params.radius, 10),
      center: new google.maps.LatLng(params.latitude, params.longitude),
      map: $scope.map
    });
    // Add 'click' listener to geofence so we can edit it.
    google.maps.event.addListener(geofence, 'click', function() {
      $scope.onShowGeofence(this.params);
    });
    $scope.geofences.push(geofence);
    return geofence;
  };
  var getGeofenceMarker = function(identifier) {
    var index = $scope.geofences.map(function(geofence) { return geofence.params.identifier; }).indexOf(identifier);
    if (index >= 0) {
      return $scope.geofences[index];
    }
    return -1;
  }
  var removeGeofence = function(identifier) {
    var marker = getGeofenceMarker(identifier);
    if (marker) {
      var index = $scope.geofences.indexOf(marker);
      $scope.geofences.splice(index, 1);
      marker.setMap(null);
      if (marker.removed) {
        return;
      }
    }
    BackgroundGeolocation.removeGeofence(identifier);
  };

  $scope.onCancelGeofence = function() {
    $scope.modal.hide();
  };
})

/**
* Settings Controller
*/
.controller('Settings', function($scope, $ionicLoading, $state) {
  $scope.syncButtonIcon = 'ion-load-c icon-animated';

  $scope.selectedValue = '';
  $scope.isSyncing = false;
  $scope.isAutoSyncDisabled = function() {
    return !$scope.isSyncing && BackgroundGeolocation.getConfig().autoSync == 'true';
  }

  $scope.onClickSync = function() {
    if ($scope.isSyncing) { return false; }

    BackgroundGeolocation.playSound('BUTTON_CLICK');
    $scope.isSyncing = true;
    BackgroundGeolocation.sync(function(rs) {
      BackgroundGeolocation.playSound('MESSAGE_SENT');
      $scope.$apply(function() {
        $scope.isSyncing = false;
      });
    }, function(error) {
      console.warn('- sync error: ', error);
      $scope.$apply(function() {
        $scope.isSyncing = false;
      })
    });
  };

  $scope.getSettings = function(group) {
    return BackgroundGeolocation.getSettings(group);
  };

  $scope.getValue = function(name) {
    return BackgroundGeolocation.getConfig()[name];
  };

  $scope.getConfig = function() {
    return BackgroundGeolocation.getConfig();
  };

  $scope.getSettingValues = function() {
    return $state.selectedSetting.values;
  };

  $scope.getSelectedSetting = function() {
    return $state.selectedSetting;
  };

  /**
  * Row-click handler
  */
  $scope.onSelectSetting = function() {
    $state.selectedSetting = this.setting;
    BackgroundGeolocation.playSound('BUTTON_CLICK');
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
    BackgroundGeolocation.playSound('BUTTON_CLICK');
    BackgroundGeolocation.set($state.selectedSetting.name, this.value);
    $state.autoSyncDisabled = !BackgroundGeolocation.getConfig().autoSync;
    $state.go('settings');
  };

  $scope.onClickDone = function() {
    //BackgroundGeolocation.set($state.selectedSetting.name, this.value);
    var config  = this.getConfig();
    var name    = $state.selectedSetting.name;
    var value   = config[name];

    BackgroundGeolocation.set(name, value);
    $state.go('settings');
  };

  /**
  * List of available settings
  */
  $scope.settings = BackgroundGeolocation.getSettings();
});
