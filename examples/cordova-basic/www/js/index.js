/**
 * Cordova Background Geolocation -- Simple Cordova Implementation
 *
 * The app will ask for a unique identifier (eg: Github username) so it can post locations to
 *  http://tracker.transistorsoft.com/locations
 * View your tracking history in your web browser by visiting:
 *  http://tracker.transistorsoft.com/{username}
 *
 * [Start] button:  Starts the plugin
 * [Stop] button:  Stops the plugin
 * [changePace] button:  Changes state between stationary & moving modes
 * [getCurrentPosition] button:  Fetch the current position
 */

var app = {
    // For posting locations to Transistor Software test-server.
    host: 'tracker.transistorsoft.com',

    // Application state
    state: {
        enabled: false,
        isMoving: false
    },
    // UI Sounds.
    sounds: {
        "ios": {
            "BUTTON_CLICK": 1104
        },
        "android": {    
            "BUTTON_CLICK": 19    
        }
    },


    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        ////
        // We request a unique identifier so you can post locations to tracker.transistorsoft.com.
        // - You can view your tracking at: http://tracker.transistorsoft.com/{username}
        // - You can completely delete your recorded locations at the web application.
        //
        this.getUsername(function(username) {
            this.configureBackgroundGeolocation(username);
        }.bind(this));
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },

    // Configure Background Geolocation
    configureBackgroundGeolocation: function(username) {
        username = username || 'cordova-basic';

        var bgGeo = window.BackgroundGeolocation;
        app.bgGeo = bgGeo;

        ////
        // Step 1:  Listen to events.  It's always best to listen to events first, before #configure
        //

        // location event: Fires whenever a location is recorded.
        bgGeo.on('location', function(location) {
            console.log('[event] location: ', location);
            app.setLocation(location);
        }, function(error) {
            console.warn('[event] location error: ', error);
        });

        // motionchange event:  Fires when plugin changes state from Stationary->Moving and vice-versa.
        bgGeo.on('motionchange', function(isMoving, location) {
            console.log('[event] motionchange, isMoving: ', isMoving, ', location: ', location);
            app.setState({
                enabled: true,
                isMoving: isMoving
            });
        });

        // providerchange event:  Fires when user changes location authorization)
        bgGeo.on('providerchange', function(provider) {
            console.log('[event] providerchange: ', provider);
            app.setProvider(provider);
        });

        // heartbeat event:  Fires every heartbeatInterval while plugin is in stationary state.  iOS requires preventSuspend: true)
        bgGeo.on('heartbeat', function(event) {
            console.log('[event] heartbeat: ', event);
        });
    
        ////
        // Step 2:  Configure the plugin ONCE when your app boots.
        //

        bgGeo.configure({
            desiredAccuracy: 0,     // Highest possible accuracy: GPS + Wifi + Cellular
            distanceFilter: 10,     // Record a location every 10 meters.
            stopTimeout: 1,         // Change state to stationary after 1 min with device "still"
            stopOnTerminate: false, // Don't stop tracking when app is terminated.
            foregroundService: true,// Prevent Android from terminating service due to memory pressure from other apps.
            heartbeatInterval: 60,  // <-- heartbeat event every 60s
            url: 'https://' + app.host + '/locations',
            params: this.getParams(username),
            debug: true,            // Debug sounds & notifications
            autoSync: true,         // Auto sync each recorded location to #url immediately.
            logLevel: bgGeo.LOG_LEVEL_VERBOSE
        }, function(state) {
            app.setState(state);
            console.log('- BackgroundGeolocation is configured and ready to use');
        });

        // Wire-up UI
        var btnEnable = document.getElementById('btn-enable');
        var btnChangePace = document.getElementById('btn-changePace');
        var btnGetCurrentPosition = document.getElementById('btn-getCurrentPosition');
        var label = document.getElementById('label-view-tracker');

        btnEnable.addEventListener('click', this.onToggleEnabled.bind(this));
        btnChangePace.addEventListener('click', this.onClickChangePace.bind(this));
        btnGetCurrentPosition.addEventListener('click', this.onClickGetCurrentPosition.bind(this));

        // Write label message of where to view tracking history
        label.innerHTML = 'View your tracking at http://' + app.host + '/' + username;
    },

    /**
    * Returns plugin's HTTP #params config.  Attach cordova-plugin-device to plugin's #params along with 
    * provided {username} as company_token so you can view your tracking history in browser at: 
        http://tracker.transistorsoft.com/{username}.
    * This is how the tracking server organizes locations by device & username
    * eg:
    params: {
        "device": {
            "platform": "Android",
            "version": "8.1.0",
            "uuid": "cd4ce2e5d0447f8a",
            "cordova": "6.3.0",
            "model": "Pixel",
            "manufacturer": "Google",
            "framework": "Cordova"
        },
        "company_token": "{username}"
    }
    *
    */
    getParams: function(username) {        
        var params = {
            device: window.device,
            company_token: username
        };
        params.device.framework = 'Cordova';
        
        return params;
    },

    onToggleEnabled: function() {
        this.playSound('BUTTON_CLICK');
        if (app.state.enabled) {
            app.bgGeo.stop(function(state) {
                console.log('- stop success');
                app.setState(state);
                app.setLabel('Stopped', 'grey');
            });
        } else {
            app.bgGeo.start(function(state) {
                console.log('- start success');
                app.setState(state);
                app.setLabel('Acquiring motionchange position...', 'red');                
            });
        }
    },

    onClickChangePace: function() {
        this.playSound('BUTTON_CLICK');
        if (!app.state.enabled) {
            console.warn('- Cannot changePace while disabled.  You must #start the plugin first');
            return;
        }
        var isMoving = !app.state.isMoving;
        app.setLabel('Acquiring motionchange position...', (isMoving) ? 'green' : 'red');
        app.updateChangePaceButton(isMoving);
        app.bgGeo.changePace(isMoving, function() {
            console.log('- changePace success');
        });
    },

    onClickGetCurrentPosition: function() {
        this.playSound('BUTTON_CLICK');
        app.bgGeo.getCurrentPosition(function(location) {
            console.log('- getCurrentPosition success: ', location);
        }, function(error) {
            console.warn('- getCurrentPosition error: ', error);
        });
    },

    setState: function(state) {
        app.state = state;
        var text = '';
        var color = 'grey';

        if (state.enabled) {
            if (state.isMoving) {
                text = 'Tracking mode';
                color = 'green';
            } else {
                text = 'Stationary mode';
                color = 'red';
            }
        } else {
            text = 'Stopped';
            color = 'grey';
        }
        this.setLabel(text, color);
        this.updateChangePaceButton(state.isMoving);
        this.updateToggleButton(state.enabled);
    },

    setLabel: function(text, color) {
        var trackingState = document.getElementById('tracking-state');
        var classNames = ['event', color];
        trackingState.innerHTML = text;
        trackingState.className = classNames.join(' ');
    },

    updateToggleButton: function(enabled) {
        var btnEnable = document.getElementById('btn-enable');
        if (enabled) {
            btnEnable.innerHTML = 'Stop';
            btnEnable.className = 'red';
        } else {
            btnEnable.innerHTML = 'Start';
            btnEnable.className = 'green';
        }
    },

    updateChangePaceButton: function(isMoving) {
        var btn = document.getElementById('btn-changePace');
        btn.className = (isMoving) ? 'red' : 'green';
    },

    setLocation: function(location) {
        var consoleEl = document.getElementById('location');

        // Print Location JSON
        var json = JSON.stringify(location, null, 2);
        consoleEl.innerHTML = json.substring(4, json.length-2);

        // Highlight animation
        consoleEl.className = "highlight";
        setTimeout(function() {
            consoleEl.className = '';
        }, 200);
    },

    setProvider: function(provider) {
        var providerEl = document.getElementById('provider');
        providerEl.innerHTML = JSON.stringify(provider);
    },

    getUsername: function(callback) {
        if (window.localStorage.getItem('username')) {
            // We have a username already, yay!
            callback(window.localStorage.getItem('username'));
            return;
        }
        // Prompt user at first boot for username.
        navigator.notification.prompt('Please enter a unique identifier (eg: Github username) so the plugin can post loctions to http://tracker.transistorsfot.com/{identifier}', function(response) {
            if (response.buttonIndex === 1 && response.input1.length > 0) {
                window.localStorage.setItem('username', response.input1);
                // We have a username
                callback(response.input1);
            } else {
                // Username declined.  Plugin will not post to tracker.transistorsoft.com
                callback(null);
            }
        }, 'Tracking Server Identifier');
    },

    playSound: function(key) {
        var soundId = app.sounds[window.device.platform.toLowerCase()].BUTTON_CLICK;
        if (soundId) {
            app.bgGeo.playSound(soundId);
        }
    }
};

app.initialize();