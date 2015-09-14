/**
* BackgroundGeolocationService This is a generic singleton wrapper for managing BackgroundGeolocation plugin and its available settings
* and configuration state in localStorage
* @author Chris Scott <chris@transistorsoft.com>
*/
var BackgroundGeolocationService = (function() {
  /**
  * @private sound-id mapping for iOS & Android.  BackgroundGeolocation plugin has a simple system-sound API
  */
  var $SOUNDS = {
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
  
  /**
  * @private {Array} List of subscribers to the plugin's "location" event.  The plugin itself doesn't allow multiple listeners so I've simply added the ability here in Javascript.
  */
  var $locationListeners = [];
  /**
  * @private {object} BackgroundGeolocation configuration
  */
  var $config = {};
  /**
  * @private BackgroundGeolocation plugin reference
  */
  var $plugin;
  /**
  * @private {String} platform
  */
  var $platform;

  // Handy shortcut for localStorage.
  var $ls = window.localStorage;

  /**
  * @private List of all available common and platform-specific settings
  */
  var $settings = {
    common: [
      {name: 'url', group: 'http', inputType: 'text', dataType: 'string', defaultValue: 'http://posttestserver.com/post.php?dir=ionic-cordova-background-geolocation'},
      {name: 'method', group: 'http', inputType: 'select', dataType: 'string', values: ['POST', 'PUT'], defaultValue: 'POST'},
      {name: 'autoSync', group: 'http', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'true'},
      {name: 'batchSync', group: 'http', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'stopOnTerminate', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'true'},
      {name: 'debug', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'true'}
    ],
    iOS: [
      {name: 'desiredAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [-1, 0, 10, 100, 1000], defaultValue: 0 },
      {name: 'distanceFilter', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 20, 50, 100, 500], defaultValue: 20 },
      {name: 'stationaryRadius', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 20, 50, 100, 500], defaultValue: 20 },
      {name: 'activityType', group: 'geolocation', dataType: 'string', inputType: 'select', values: ['Other', 'AutomotiveNavigation', 'Fitness', 'OtherNavigation'], defaultValue: 'Other'},
      {name: 'disableElasticity', group: 'geolocation', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'}
    ],
    Android: [
      {name: 'desiredAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 100, 1000], defaultValue: 0 },
      {name: 'distanceFilter', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 20, 50, 100, 500], defaultValue: 20 },
      {name: 'locationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 5000},
      {name: 'fastestLocationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 1000},
      {name: 'activityRecognitionInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 10000, 30000, 60000], defaultValue: 10000},
      {name: 'triggerActivities', group: 'geolocation', dataType: 'string', inputType: 'select', values: ['in_vehicle', 'on_bicycle', 'on_foot', 'running', 'walking'], defaultValue: 'in_vehicle, on_bicycle, running, walking, on_foot'},
      {name: 'stopTimeout', group: 'geolocation', dataType: 'integer', inputType: 'activity_recognition', inputType: 'select', values: [0, 1, 5, 10, 15], defaultValue: 0},
      {name: 'forceReloadOnMotionChange', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'forceReloadOnLocationChange', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'forceReloadOnGeofence', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'},
      {name: 'startOnBoot', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: 'false'}
    ]
  };

  // Iterate list-of-settings and build our @private config {} from localStorage || defaultValue
  var setting;
  var value;
  var rs = [].concat($settings.common).concat($settings.iOS).concat($settings.Android);
  for (var n=0,len=rs.length;n<len;n++) {
    setting = rs[n];
    value = $ls.getItem('settings:' + setting.name) || setting.defaultValue;
    if (setting.dataType === 'integer') {
      value = parseInt(value, 10);
    }
    $config[setting.name] = value;
  }

  // Build platform-specific list-of-settings
  var platformSettings = undefined;
  var getPlatformSettings = function() {
    if (platformSettings === undefined) {
      platformSettings = [].concat($settings[$platform||'iOS']).concat($settings.common);
      if (!$platform) {
        platformSettings = platformSettings.concat($settings['Android']);
      }
    }
    return platformSettings;
  };

  /**
  * This is the BackgroundGeolocation callback.  I've set up the ability to add multiple listeners here so this
  * callback simply calls upon all the added listeners here
  */
  var fireLocationListeners = function(location, taskId) {
    console.log('[js] BackgroundGeolocation location received: ' + JSON.stringify(location));
    var me = this;
    var callback;
    for (var n=0,len=$locationListeners.length;n<len;n++) {
      callback = $locationListeners[n];
      try {
        callback.call(me, location);
      } catch (e) {
        console.log('error: ' + e.message);
      }
    }
    $plugin.finish(taskId);
  };

  return {
    /**
    * Set the plugin state to track in background
    * @param {Boolean} willEnable
    */
    setEnabled: function(willEnable, callback) {
      window.localStorage.setItem('bgGeo:enabled', willEnable);
      if ($plugin) {
        if (willEnable) {
          $plugin.start(callback);
        } else {
          $plugin.stop(callback);
        }
      }
    },
    /**
    * Is the plugin enabled to run in background?
    * @return {Boolean}
    */
    getEnabled: function() {
      return window.localStorage.getItem('bgGeo:enabled') === 'true';
    },
    /**
    * Toggle stationary/aggressive mode
    * @param {Boolean} willStart
    */
    setPace: function(willStart) {
      window.localStorage.setItem('bgGeo:started', willStart);
      if ($plugin) {
        $plugin.changePace(willStart);
      }
    },
    /**
    * Is the plugin engaged for stationary or aggressive?
    * @return {Boolean} true if in aggressive-mode; false if in stationary-mode
    */
    getPace: function() {
      return window.localStorage.getItem('bgGeo:started') === 'true';
    },
    /**
    * Manually sync plugin's persisted locations to server
    */
    sync: function(success, failure) {
      if ($plugin) {
        $plugin.sync(success, failure);
      } else {
        // Fake it for browser testing.
        setTimeout(success, 1000);
      }
    },
    finish: function(taskId) {
      console.log('- BackgroundGeolocationService#finish, taskId: ', taskId);
      if ($plugin) {
        $plugin.finish(taskId);
      }
    },
    /**
    * Add an event-listener for location-received from $plugin
    * @param {Function} callback
    */
    onLocation: function(callback) {
      $locationListeners.push(callback);
    },
    /**
    * Add a stationary-listener
    * @param {Function} stationary event-listener
    */
    onMotionChange: function(callback, failure) {
      var me = this;
      if ($plugin) {
        $plugin.onMotionChange(callback, failure);
      }
    },
    onGeofence: function(callback) {
      var me = this;
      if ($plugin) {
        $plugin.onGeofence(function(params, taskId) {
          console.log('- onGeofence:' + JSON.stringify(params));
          console.log('  taskId: ' + taskId);
          try {
            callback.call(me, params, taskId);
          } catch (e) {
            console.log('error: ' + e.message, e);  
          }
          $plugin.finish(taskId);
        });
      }
    },

    /**
    * Return the current BackgroundGeolocation config-state as stored in localStorage
    * @return {Object}
    */
    getConfig: function() {
      return $config;
    },
    /**
    * Return a list of all available plugin settings, filtered optionally by "group"
    * @param {String} group
    * @return {Array}
    */
    getSettings: function(group) {
      var mySettings = getPlatformSettings();
      if (group) {
        var filterFn = function(setting) {
          return setting.group === group;
        };
        return mySettings.filter(filterFn);
      } else {
        return mySettings;
      }
    },
    /**
    * Get a single config value by key
    * @param {String} key A BackgroundGeolocation setting key to return a value for
    * @return {Mixed}
    */
    get: function(key) {
      return $config[key];
    },
    /**
    * Set a single config value by key,value
    * @param {String} key
    * @param {Mixed} value
    */
    set: function(key, value) {
      $ls.setItem('settings:' + key, value);
      $config[key] = value;

      if ($plugin) {
        $plugin.setConfig(function(response) {
          console.log('- setConfig: ', response);
        }, function(error) {
          console.warn('- setConfig error: ', error);
        }, $config);
      }
    },
    /**
    * Configure the BackgroundGeolocation Cordova $plugin
    * @param {BackgroundGeolocation} bgGeoPlugin
    */
    configurePlugin: function(bgGeoPlugin) {
      var device = ionic.Platform.device();
      $platform = device.platform;

      var me      = this;
      var config  = this.getConfig();

      config.params = config.params || {};

      // Append Cordova device-info to POST params so we can map a device-id to the location
      config.params.device = device;

      $plugin = bgGeoPlugin;

      // Configure BackgroundGeolocation Plugin
      $plugin.configure(fireLocationListeners, function(error) { 
        console.warn('BackgroundGeolocation Error: ' + error);
      }, config);

      if (this.getEnabled()) {
        $plugin.start();
      }
    },
    /**
    * Return a reference to Cordova BackgroundGeolocation plugin
    * @return {BackgroundGeolocation}
    */
    getPlugin: function() {
      return $plugin;
    },
    addGeofence: function(data, callback) {
      if ($plugin) {
        var me = this;
        $plugin.addGeofence(data, function(res) {
          me.playSound('ADD_GEOFENCE');
          callback.call(me, res);
        });
      } else {
        callback.call(me);
      }
    },
    removeGeofence: function(identifier) {
      if ($plugin) {
        var me = this;
        $plugin.removeGeofence(identifier, function(status) {
          me.playSound('ADD_GEOFENCE');
        }, function(error) {
          console.log('- FAILED to remove geofence');
        });
      }
    },
    getCurrentPosition: function(callback, failure, options) {
      if ($plugin) {
        $plugin.getCurrentPosition(callback, failure, options);
      }
    },
    playSound: function(action) {
      if ($plugin) {
        var soundId = $SOUNDS[action + '_' + $platform.toUpperCase()];
        if (soundId) {
          $plugin.playSound(soundId);
        } else {
          console.warn('Failed to locate sound-id "' + action + '"');
        }
      }
    }
  };
})();