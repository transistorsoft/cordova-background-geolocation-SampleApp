angular.module('services.Settings', []).factory('Settings', function($rootScope) {
	var config     = {};
  var device;
  var platform;

  var SETTINGS = {
    common: [
      {name: 'url', group: 'http', inputType: 'text', dataType: 'string', defaultValue: 'http://posttestserver.com/post.php?dir=ionic-cordova-background-geolocation'},
      {name: 'method', group: 'http', inputType: 'select', dataType: 'string', values: ['POST', 'PUT'], defaultValue: 'POST'},
      {name: 'autoSync', group: 'http', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'true'},
      {name: 'batchSync', group: 'http', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'stopOnTerminate', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'true'},
      {name: 'startOnBoot', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'stopTimeout', group: 'activity recognition', dataType: 'integer', inputType: 'select', values: [0, 1, 2, 5, 10, 15], defaultValue: 1},
      {name: 'activityRecognitionInterval', group: 'activity recognition', dataType: 'integer', inputType: 'select', values: [0, 1000, 10000, 30000, 60000], defaultValue: 10000},
      {name: 'debug', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'true'},
      {name: 'deferTime', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10*1000, 30*1000, 60*1000, 10*60*1000], defaultValue: 0},
      {name: 'disableElasticity', group: 'geolocation', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'heartbeatInterval', group: 'application', dataType: 'integer', inputType: 'select', values: [-1, 10, 30, 60, (2*60), (15*60)], defaultValue: 60},
      {name: 'locationTimeout', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 5, 10, 30, 60], defaultValue: 60},
    ],
    iOS: [
      {name: 'desiredAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [-1, 0, 10, 100, 1000], defaultValue: 0 },
      {name: 'distanceFilter', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 20, 50, 100, 500, 1000], defaultValue: 20 },
      {name: 'stationaryRadius', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 20, 50, 100, 500], defaultValue: 20 },
      {name: 'activityType', group: 'geolocation', dataType: 'string', inputType: 'select', values: ['Other', 'AutomotiveNavigation', 'Fitness', 'OtherNavigation'], defaultValue: 'OtherNavigation'},
      {name: 'stopDetectionDelay', group: 'activity recognition', dataType: 'integer', inputType: 'select', values: [0, 1, 2, 5], defaultValue: 0},
      {name: 'preventSuspend', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'pausesLocationUpdatesAutomatically', group: 'geolocation', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: undefined},
      {name: 'useSignificantChangesOnly', group: 'geolocation', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'disableMotionActivityUpdates', group: 'activity recognition', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
    ],
    Android: [
      {name: 'desiredAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 100, 1000], defaultValue: 0 },
      {name: 'distanceFilter', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 20, 50, 100, 500], defaultValue: 20 },
      {name: 'locationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 5000},
      {name: 'fastestLocationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 1000},
      {name: 'triggerActivities', group: 'activity recognition', dataType: 'string', inputType: 'select', values: ['in_vehicle', 'on_bicycle', 'on_foot', 'running', 'walking'], defaultValue: 'in_vehicle, on_bicycle, running, walking, on_foot'},
      {name: 'forceReloadOnBoot', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'forceReloadOnMotionChange', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'forceReloadOnLocationChange', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'forceReloadOnGeofence', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'forceReloadOnHeartbeat', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'foregroundService', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'true'}
    ]
  };

  /**
  * @private sound-id mapping for iOS & Android.  BackgroundGeolocation plugin has a simple system-sound API
  */
  var SOUNDS = {
    "LONG_PRESS_ACTIVATE_IOS": 1113,
    "LONG_PRESS_ACTIVATE_ANDROID": 27,
    "LONG_PRESS_CANCEL_IOS": 1075,
    "LONG_PRESS_CANCEL_ANDROID": 94,
    "ADD_GEOFENCE_IOS": 1114,
    "ADD_GEOFENCE_ANDROID": 28,
    "BUTTON_CLICK_IOS": 1104,
    "BUTTON_CLICK_ANDROID": 89,
    "MESSAGE_SENT_IOS": 1303,
    "MESSAGE_SENT_ANDROID": 90,
    "ERROR_IOS": 1006
  };

  // Iterate list-of-settings and build our @private config {} from localStorage || defaultValue
  var setting;
  var value;
  var rs = [].concat(SETTINGS.common).concat(SETTINGS.iOS).concat(SETTINGS.Android);
  for (var n=0,len=rs.length;n<len;n++) {
    setting = rs[n];
    value = window.localStorage.getItem('settings:' + setting.name) || setting.defaultValue;
    if (setting.dataType === 'integer') {
      value = parseInt(value, 10);
    }
    config[setting.name] = value;
  }

  // Build platform-specific list-of-settings
  var platformSettings = undefined;
  var getPlatformSettings = function() {
    if (platformSettings === undefined) {
      platformSettings = [].concat(SETTINGS[platform||'iOS']).concat(SETTINGS.common);
      if (!platform) {
        platformSettings = platformSettings.concat(SETTINGS['Android']);
      }
    }
    return platformSettings;
  };

  ionic.Platform.ready(function() {
    device = ionic.Platform.device();
    platform = device.platform || 'Android';
  });

	return {
		getConfig: function() {
			return config;
		},
    getSettings: function(group) {
      var mySettings = getPlatformSettings();
      var filterFn = function(setting) { return setting.group === group; };
      return (group) ? mySettings.filter(filterFn) : mySettings;
    },
    /**
    * Get a single config value by key
    * @param {String} key A BackgroundGeolocation setting key to return a value for
    * @return {Mixed}
    */
    get: function(key) {
      return config[key];
    },
    /**
    * Set a single config value by key,value
    * @param {String} key
    * @param {Mixed} value
    */
    set: function(key, value) {
      window.localStorage.setItem('settings:' + key, value);
      config[key] = value;
    },
    /**
    * Return a sound ID
    */
    getSoundId: function(key) {
      var id = SOUNDS[key + "_" + platform.toUpperCase()];
      if (!id) {
        console.warn('Failed to find sound ID for ', key);
        id = 0;
      }
      return id;
    }
	};
});