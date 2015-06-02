
angular.module('starter.controllers', [])

/**
* Maps Controller
*/
.controller('Maps', function($scope, $ionicModal, $ionicLoading, $state) {
  var PLAY_BUTTON_CLASS = "ion-play button-balanced",
      PAUSE_BUTTON_CLASS = "ion-pause button-assertive";

  ionic.Platform.ready(function() {
    BackgroundGeolocation.onLocation($scope.setCurrentLocationMarker);
    BackgroundGeolocation.onStationary($scope.setStationaryMarker);
  });

  $scope.map                    = undefined;
  $scope.currentLocation        = undefined;
  $scope.previousLocation       = undefined;
  $scope.locations              = [];
  $scope.path                   = undefined;
  $scope.currentLocationMarker  = undefined;
  $scope.locationAccuracyMarker = undefined;
  $scope.stationaryRadius       = undefined;

  $scope.odometer = 0;

  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

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

    google.maps.event.addListener(map, 'longpresscancel', function() {
      geofenceCursor.setMap(null);
      BackgroundGeolocation.playSound('LONG_PRESS_CANCEL');
    });
    google.maps.event.addListener(map, 'longpresshold', function(e) {      
      geofenceCursor.setPosition(e.latLng);
      geofenceCursor.setMap(map);
      BackgroundGeolocation.playSound('LONG_PRESS_ACTIVATE')
    });
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
      $scope.locations.push(new google.maps.Marker({
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
  $scope.newGeofence = {};

  $scope.onAddGeofence = function(latLng) {
    $scope.newGeofence = {
      latitude: latLng.lat(),
      longitude: latLng.lng(),
      identifier: '',
      radius: '',
      notifyOnEntry: true,
      notifyOnExit: false,
      single: true,
      action: 'new'
    };
    $scope.modal.show();
  };
  $scope.onEditGeofence = function() {
    $scope.modal.hide();

    if ($scope.newGeofence.action === 'new') {
      // Add longpress event for adding GeoFence of hard-coded radius 200m.
      var geofence = new google.maps.Circle({
        fillColor: '#33cc66',
        fillOpacity: 0.4,
        strokeColor: '#33cc66',
        params: {
          identifier: $scope.newGeofence.identifier,
          radius: $scope.newGeofence.radius,
          notifyOnEntry: $scope.newGeofence.notifyOnEntry,
          notifyOnExit: $scope.newGeofence.notifyOnExit,
          single: $scope.newGeofence.single
        },
        radius: parseInt($scope.newGeofence.radius, 10),
        center: new google.maps.LatLng($scope.newGeofence.latitude, $scope.newGeofence.longitude),
        map: $scope.map
      });
      google.maps.event.addListener(geofence, 'click', function() {
        $scope.newGeofence = this.params;
        $scope.newGeofence.action = 'edit';
        $scope.newGeofence.marker = geofence;
        $scope.modal.show();
      })
      BackgroundGeolocation.addGeofence($scope.newGeofence);
    } else {
      BackgroundGeolocation.removeGeofence($scope.newGeofence.identifier);
      $scope.newGeofence.marker.setMap(null);
    }
  };

  $scope.onCancelGeofence = function() {
    $scope.modal.hide();
  }
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
