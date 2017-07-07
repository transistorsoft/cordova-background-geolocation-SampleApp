# :large_blue_diamond: [Ionic 3] Cordova Background Geolocation &mdash; Demo

:warning: For the Ionic 1 version, use the branch [ionic1](https://github.com/transistorsoft/cordova-background-geolocation-SampleApp/tree/ionic1)

[![Google Play](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/google-play-icon.png)](https://play.google.com/store/apps/details?id=com.transistorsoft.backgroundgeolocation.ionic2)

Fully-featured, [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation](http://shop.transistorsoft.com/pages/cordova-background-geolocation-premium)

![Home](https://www.dropbox.com/s/byaayezphkwn36h/home-framed-350.png?dl=1)
![Settings](https://www.dropbox.com/s/8lvnpp0gowitagq/settings-framed-350.png?dl=1)

Edit settings and observe the behavour of **Background Geolocation** changing in **real time**.

## :large_blue_diamond: Installation

### Step 1: Start by cloning this repo

```bash
$ git clone https://github.com/transistorsoft/cordova-background-geolocation-SampleApp.git
```

----------------------------------------------------------------------------
:warning: For the **Ionic 1** version, use the tagged branch [ionic1](https://github.com/transistorsoft/cordova-background-geolocation-SampleApp/tree/ionic1) and [follow further setup steps](https://github.com/transistorsoft/cordova-background-geolocation-SampleApp/tree/ionic1#step-2--required-plugins) on the `README` there.

```bash
$ git checkout ionic1
```

----------------------------------------------------------------------------

### Step 2:  Building and Running the Ionic 3 App

```bash
$ npm install

$ ionic platform add android
$ ionic run android --device

$ ionic platform add ios
$ ionic run ios --emulator
// opens a web console which receives all your locations
$ npm run open  
```

The quickest way to see the plugin in-action is to boot the **iOS** simulator and *simulate location*

![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/simulate-location.png)

## :large_blue_diamond: Debug Mode

The plugin has a `debug` mode for field-testing.  The plugin will emit sounds during its life-cycle events:

| Event | iOS | Android |
|-------|-----|---------|
| Exit stationary-region | Calendar event sound | n/a |
| Location recorded | SMS-sent sound | "blip" |
| Aggressive geolocation engaged | SIRI listening sound | "doodly-doo" |
| Acquiring stationary location | "tick, tick, tick" | n/a |
| Stationary state | "bloom" | long "beeeeeeep" |
| Geofence crossing | trumpets/fanfare | boop-boop-boop |

**NOTE:**  In order for debug sounds to operate *when the app is in background*, you must enable the `Audio and Airplay` **Background Mode**.

![](https://camo.githubusercontent.com/ad01117185eb13a237efcfa1eaf7e39346a967ed/68747470733a2f2f646c2e64726f70626f7875736572636f6e74656e742e636f6d2f752f323331393735352f636f72646f76612d6261636b67726f756e642d67656f6c6f636169746f6e2f656e61626c652d6261636b67726f756e642d617564696f2e706e67)

## :large_blue_diamond: Simple Testing Server

A simple Node-based [web-application](https://github.com/transistorsoft/background-geolocation-console) with SQLite database is available for field-testing and performance analysis.  If you're familiar with Node, you can have this server up-and-running in about **one minute**.

![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/background-geolocation-console-map.png)

![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/background-geolocation-console-grid.png)

## :large_blue_diamond: Adding Geofences

The app implements a **longtap** event on the map.  Simply **tap & hold** the map to initiate adding a geofence.

![Tap-hold to add geofence](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/screenshot-iphone5-add-geofence-framed-README.png)

Enter an `identifier`, `radius`, `notifyOnExit`, `notifyOnEntry`.


