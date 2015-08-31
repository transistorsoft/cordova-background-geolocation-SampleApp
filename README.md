# Cordova Background Geolocation &mdash; Sample Application

<a href="market://details?id=com.transistorsoft.background_geolocation.ionic">


[![Google Play](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/google-play-icon.png)](http://play.google.com/store/apps/details?id=com.transistorsoft.background_geolocation.ionic)

Fully-featured, [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation  (Premium Version)](http://christocracy.github.io/cordova-background-geolocation/)

![Home](https://www.dropbox.com/s/4cggjacj68cnvpj/screenshot-iphone5-geofences-framed.png?dl=1)
![Settings](https://www.dropbox.com/s/mmbwgtmipdqcfff/screenshot-iphone5-settings-framed.png?dl=1)

Edit settings and observe the behavour of **Background Geolocation** changing in **real time**.

## Installation

**Step 1.** Start by cloning this repo

```
$ git clone https://github.com/christocracy/cordova-background-geolocation-SampleApp.git
```

**Step 2.**  Now we must install the application's required plugins.  Copy/paste the following one-liner (Cordova 5-style) into your console to install all the required plugins.

```
$ cordova plugin add cordova-plugin-device cordova-plugin-console cordova-plugin-whitelist cordova-plugin-splashscreen com.ionic.keyboard
```

**Step 3.**  Now install the `cordova-background-geolocation` plugin.  Install **one** of the following:

   **A. [Premium Version](https://github.com/transistorsoft/cordova-background-geolocation.git) (requires paid license)**

```
$ cordova plugin add https://github.com/transistorsoft/cordova-background-geolocation.git
```

   **B. [Free iOS Version](https://github.com/transistorsoft/cordova-background-geolocation-lt)**

```
$ cordova plugin add https://github.com/transistorsoft/cordova-background-geolocation-lt.git
```

**Step 4.** Add your desired platform(s) and build.

```
$ cordova platform add ios
$ cordova build ios

$ cordova platform add android
$ cordova build android
$ cordova run android
```

**Step 5.** Boot the **iOS** Simulator

The quickest way to see the plugin in-action is to boot the **iOS** simulator and *simulate location*

![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/simulate-location.png)

## Debug Mode

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

## Adding Geofences

The app implements a **longtap** event on the map.  Simply **tap & hold** the map to initiate adding a geofence.

![Tap-hold to add geofence](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/screenshot-iphone5-add-geofence-framed-README.png)

Enter an `identifier`, `radius`, `notifyOnExit`, `notifyOnEntry`.


