
angular.module('starter.controllers', [])

/**
* Maps Controller
*/
.controller('Maps', function($scope, $ionicLoading, $state) {
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

  $scope.mapCreated = function(map) {
    $scope.map = map;
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
    $state.transitionTo('settings');
  };
  /**
  * Center map button
  */
  $scope.centerOnMe = function () {
    
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
})

/**
* Settings Controller
*/
.controller('Settings', function($scope, $ionicLoading, $state) {
  $scope.selectedValue = '';
  $scope.isAutoSyncDisabled = function() {
    return BackgroundGeolocation.getConfig().autoSync == 'true';
  }

  $scope.onClickSync = function() {
    BackgroundGeolocation.sync();
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
