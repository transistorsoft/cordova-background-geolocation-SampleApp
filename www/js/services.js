/**
* BackgroundGeolocationService This is a generic singleton wrapper for managing BackgroundGeolocation plugin and its available settings
* and configuration state in localStorage
* @author Chris Scott <chris@transistorsoft.com>
*/
var BackgroundGeolocation = (function() {
	var locationListeners = [];

	var plugin;
	var ls = window.localStorage;

	var settings = {
		common: [
			{name: 'distanceFilter', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 10, 20, 50, 100, 500], defaultValue: 20 },
	  	{name: 'desiredAccuracy', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [-1, 0, 10, 100, 1000], defaultValue: 0 },
	    {name: 'stationaryRadius', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 20, 50, 100, 500], defaultValue: 20 },
	    {name: 'url', group: 'http', inputType: 'text', dataType: 'string', defaultValue: 'http://posttestserver.com/post.php?dir=ionic-cordova-background-geolocation'},
	    {name: 'autoSync', group: 'http', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: true},
	    {name: 'batchSync', group: 'http', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: false},
	    {name: 'stopOnTerminate', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: true},
	    {name: 'debug', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: true}
	 	],
	  iOS: [
	  	{name: 'activityType', group: 'geolocation', dataType: 'string', inputType: 'select', values: ['Other', 'AutomotiveNavigation', 'Fitness', 'OtherNavigation'], defaultValue: 'Other'},
	    {name: 'disableElasticity', group: 'geolocation', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: false}
	  ],
	  Android: [
	  	{name: 'locationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 5000},
	    {name: 'fastestLocationUpdateInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 5000, 10000, 30000, 60000], defaultValue: 1000},
	    {name: 'activityRecognitionInterval', group: 'geolocation', dataType: 'integer', inputType: 'select', values: [0, 1000, 10000, 30000, 60000], defaultValue: 10000},
	    {name: 'stopTimeout', group: 'geolocation', dataType: 'integer', inputType: 'activity_recognition', inputType: 'select', values: [0, 1, 5, 10, 15], defaultValue: 0},
	    {name: 'forceReload', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: false},
	    {name: 'startOnBoot', group: 'application', dataType: 'boolean', inputType: 'select', values: ['true', 'false'], defaultValue: false}
	  ]
	};

	// Build a config {}.
	var config = {};

	var setting;
	var value;
	var rs = [].concat(settings.common).concat(settings.iOS).concat(settings.Android);

	// Iterate list-of-settings and build a config {} from localStorage || defaultValue
	for (var n=0,len=rs.length;n<len;n++) {
		setting = rs[n];
		value = ls.getItem('settings:' + setting.name) || setting.defaultValue;
		if (setting.dataType === 'integer') {
			value = parseInt(value, 10);
		}
		config[setting.name] = value;
	}

	// Build platform-specific list-of-settings
	var platformSettings = undefined;
	var getPlatformSettings = function() {
		if (platformSettings === undefined) {
			var platform = ionic.Platform.device().platform || 'iOS';
    	platformSettings = [].concat(settings.common).concat(settings[platform]);
    }
    return platformSettings;
	};

	return {
		/**
		* Set the plugin state to track in background
		*/
		setEnabled: function(willEnable) {
			window.localStorage.setItem('bgGeo:enabled', willEnable);
	    if (plugin) {
	      if (willEnable) {
	        plugin.start();
	      } else {
	        plugin.stop();
	      }
	    }
		},
		/**
		* Is the plugin enabled to run in background?
		*/
		getEnabled: function() {
			return window.localStorage.getItem('bgGeo:enabled') === 'true';
		},
		/**
		* Toggle stationary/aggressive mode
		*/
		setPace: function(willStart) {
			window.localStorage.setItem('bgGeo:started', willStart);
	    if (plugin) {
	      plugin.changePace(willStart);
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
		* Sync plugin's persisted locations to server
		*/
		sync: function() {
			if (plugin) {
				plugin.sync(function(res) {
					console.log('syncing');
				}, function(error) {
					console.log('sync failure');
				});
			}
		},

		/**
		* Add an event-listener for location-received from plugin
		*/
		onLocation: function(callback, scope) {
			locationListeners.push({
				fn: callback,
				scope: scope || this
			});
		},
		/**
		* Add a stationary-listener
		*/
		onStationary: function(callback, scope) {
			var me = this;
			if (plugin) {
				plugin.onStationary(function(location, taskId) {
					callback.call(scope||me, location);
					plugin.finish(taskId);
				});
			}
		},
		/**
		* Return the current config-state as stored in localStorage
		* @return {Object}
		*/
		getConfig: function() {
			return config;
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
			ls.setItem('settings:' + key, value);
			config[key] = value;

	    if (plugin) {
	      plugin.setConfig(function(response) {
	        console.log('- setConfig: ', response);
	      }, function(error) {
	        console.warn('- setConfig error: ', error);
	      }, config);
	    }
		},
		/**
		* Configure the BackgroundGeolocation Cordova plugin
		*/
		configurePlugin: function(bgGeoPlugin) {
			var me = this;
			plugin = bgGeoPlugin;

			console.log('- BackgroundGeolocation setPlugin: ', bgGeoPlugin);

			// Configure BackgroundGeolocation Plugin
			plugin.configure(this.fireLocationListeners, function(error) { 
				console.warn('BackgroundGeolocation Error: ' + error);
			}, this.getConfig());

			if (this.getEnabled()) {
				plugin.start();
			}
		},
		/**
		* Return a reference to Cordova BackgroundGeolocation plugin
		*/
		getPlugin: function() {
			return plugin;
		},
		/**
		* This is the BackgroundGeolocation callback.  I've set up the ability to add multiple listeners here so this
		* callback simply calls upon all the added listeners here
		*/
		fireLocationListeners: function(location, taskId) {
			console.log('[js] BackgroundGeolocation location received: ' + JSON.stringify(location));
			var listener;
			for (var n=0,len=locationListeners.length;n<len;n++) {
				listener = locationListeners[n];
				listener.fn.call(listener.scope, location);
			}
			plugin.finish(taskId);
		}
	};
})();