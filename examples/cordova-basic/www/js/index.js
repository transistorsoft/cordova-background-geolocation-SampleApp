/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application state
    state: {
        enabled: false,
        isMoving: false
    },

    setState(state) {
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
    },

    setLabel(text, color) {
        var trackingState = document.getElementById('tracking-state');
        var classNames = ['event', color];
        trackingState.innerHTML = text;
        trackingState.className = classNames.join(' ');
    },

    updateChangePaceButton: function(isMoving) {
        var btn = document.getElementById('btn-changePace');
        btn.className = (isMoving) ? 'red' : 'green';
    },

    setLocation: function(location) {
        var consoleEl = document.getElementById('console');

        // Print Location JSON
        consoleEl.innerHTML = JSON.stringify(location, null, 2);

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

    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        // We request a unique identifier so you can view your tracking at http://tracker.transistorsoft.com/{username}
        // You can completely delete your recorded locations later.
        if (!window.localStorage.getItem('username')) {
            this.promptUsername(function(username) {
                this.configureBackgroundGeolocation(username);
            });
        } else {
            // We have a username.
            this.configureBackgroundGeolocation(window.localStorage.getItem('username'));
        }
        
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },

    // Configure Background Geolocation
    configureBackgroundGeolocation: function(username) {
        var btnStart = document.getElementById('btn-start');
        var btnStop = document.getElementById('btn-stop');
        var btnChangePace = document.getElementById('btn-changePace');
        var btnGetCurrentPosition = document.getElementById('btn-getCurrentPosition');
        var labelViewTracker = document.getElementById('label-view-tracker');

        var bgGeo = window.BackgroundGeolocation;
        app.bgGeo = bgGeo;

        // Step 1:  Listen to events.
        bgGeo.on('location', function(location) {
            console.log('[event] location: ', location);
            app.setLocation(location);

        }, function(error) {
            console.warn('[event] location error: ', error);
        });

        bgGeo.on('motionchange', function(isMoving, location) {
            console.log('[event] motionchange, isMoving: ', isMoving, ', location: ', location);
            app.setState({
                enabled: true,
                isMoving: isMoving
            });            
        });

        bgGeo.on('providerchange', function(provider) {
            console.log('[event] providerchange: ', provider);
            app.setProvider(provider);
        });

        bgGeo.on('heartbeat', function(event) {
            console.log('[event] heartbeat: ', event);
        });

        ////
        // Set params to window.device.  Append company_token if username provided so you can view
        //  your tracking history in browser at: http://tracker.transistorsoft.com/{username}
        //
        var params = {
            device: window.device
        };
        params.device.framework = 'Cordova';

        var url = null;
        if (username) {
            url = 'http://tracker.transistorsoft.com/locations';
            params.company_token = username;
            labelViewTracker.innerHTML = 'View your tracking at http://tracker.transistorsoft.com/' + username;
        }

        // Step 2:  Configure the plugin ONCE when your app boots.
        bgGeo.configure({
            desiredAccuracy: 0,
            distanceFilter: 10,
            foregroundService: true,
            url: url,
            params: params,
            debug: true,
            autoSync: true,
            logLevel: bgGeo.LOG_LEVEL_VERBOSE,

        }, function(state) {
            app.setState(state);
            console.log('- BackgroundGeolocation is configured and ready to use');            
        });

        // Wire-up UI
        btnStart.addEventListener('click', this.onClickStart.bind(this));
        btnStop.addEventListener('click', this.onClickStop.bind(this));
        btnChangePace.addEventListener('click', this.onClickChangePace.bind(this));
        btnGetCurrentPosition.addEventListener('click', this.onClickGetCurrentPosition.bind(this));
    },

    onClickStart() {
        app.setLabel('Acquiring motionchange position...', 'red');
        app.bgGeo.start(function() {
            console.log('- start success');
        });
    },

    onClickStop: function() {
        app.bgGeo.stop(function() {
            console.log('- stop success');
            app.setState({
                enabled: false,
                isMoving: false
            });
        });
    },

    onClickChangePace: function() {
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
        app.bgGeo.getCurrentPosition(function(location) {
            console.log('- getCurrentPosition success: ', location);
        }, function(error) {
            console.warn('- getCurrentPosition error: ', error);
        });
    },

    promptUsername: function(callback) {
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
    }

};

app.initialize();