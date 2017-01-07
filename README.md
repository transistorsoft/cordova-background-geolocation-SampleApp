# Cordova Background Geolocation &mdash; Sample Application

<a href="market://details?id=com.transistorsoft.background_geolocation.ionic">


[![Google Play](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/google-play-icon.png)](http://play.google.com/store/apps/details?id=com.transistorsoft.background_geolocation.ionic)

Fully-featured, [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation  (Premium Version)](http://shop.transistorsoft.com/pages/cordova-background-geolocation-premium)

![Home](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/screenshot-iphone5-geofences-framed-README.png)
![Settings](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/screenshot-iphone5-settings-framed-README.png)

Edit settings and observe the behavour of **Background Geolocation** changing in **real time**.

## Installation

### Step 1: Start by cloning this repo

```
$ git clone https://github.com/transistorsoft/cordova-background-geolocation-SampleApp.git
```

### Step 2:  Required plugins

Now we must install the application's required plugins.  Copy/paste the following one-liner (Cordova 5-style) into your console to install all the required plugins.

```
$ cordova plugin add cordova-plugin-device cordova-plugin-console cordova-plugin-splashscreen
```

If you're using **PhoneGap Build**, add the following plugins to your `config.xml` instead:
```xml
  <preference name="android-build-tool" value="gradle" />

  <plugin name="cordova-background-geolocation-lt" />
  <plugin name="cordova-plugin-console" />
  <plugin name="cordova-plugin-device" />
  <plugin name="cordova-plugin-splashscreen" />
```

### Step 3: Install `cordova-background-geolocation` plugin.  

Install **one** of the following:

   **A. [Premium Version](https://github.com/transistorsoft/cordova-background-geolocation.git) (requires paid license)**

```
$ cordova plugin add https://github.com/transistorsoft/cordova-background-geolocation.git
```

   **B. [Free Version](https://github.com/transistorsoft/cordova-background-geolocation-lt)** (Free version can be built for Android but will only work with **this** sample app)

```
$ cordova plugin add cordova-background-geolocation-lt
```

Or for **PhoneGap Build**:
```
  <plugin name="cordova-background-geolocation-lt" />
```

### Step 4: Build

```
$ cordova platform add ios
$ cordova build ios

$ cordova platform add android
$ cordova build android
$ cordova run android
```

#### Building Android
If you wish try the **Free Version** for **Android** in your *own* app, modify your `config.xml` as follows (your app **must** be named `com.transistorsoft.backgroundgeolocation.ionic`:

```xml
<widget id="com.transistorsoft.backgroundgeolocation.ionic" version="2.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
  <preference name="cordova-background-geolocation-license" value="4bbb513c013111eae951647fd4f9e79f127fce6f7a00e9d327db9ea2a053a0df" />
```


#### Step 5: Boot the **iOS** Simulator

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

## Simple Testing Server

A simple Node-based [web-application](https://github.com/transistorsoft/background-geolocation-console) with SQLite database is available for field-testing and performance analysis.  If you're familiar with Node, you can have this server up-and-running in about **one minute**.

![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/background-geolocation-console-map.png)

![](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/background-geolocation-console-grid.png)

## Adding Geofences

The app implements a **longtap** event on the map.  Simply **tap & hold** the map to initiate adding a geofence.

![Tap-hold to add geofence](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/screenshot-iphone5-add-geofence-framed-README.png)

Enter an `identifier`, `radius`, `notifyOnExit`, `notifyOnEntry`.


