# Cordova Background Geolocation &mdash; Sample Application

<a href="market://details?id=com.transistorsoft.background_geolocation.ionic">


[![Google Play](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/google-play-icon.png)](http://play.google.com/store/apps/details?id=com.transistorsoft.background_geolocation.ionic)

Fully-featured, [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation  (Premium Version)](http://christocracy.github.io/cordova-background-geolocation/)

![Home](https://www.dropbox.com/s/4cggjacj68cnvpj/screenshot-iphone5-geofences-framed.png?dl=1)
![Settings](https://www.dropbox.com/s/mmbwgtmipdqcfff/screenshot-iphone5-settings-framed.png?dl=1)

Edit settings and observe the behavour of **Background Geolocation** changing in **real time**.

## Installation

- Start by cloning this repo

```
$ git clone https://github.com/christocracy/cordova-background-geolocation-SampleApp.git
```

- Now we must install the application's required plugins.  Copy/paste the following one-liner (Cordova 5-style) into your console to install all the required plugins.

```
$ cordova plugin add cordova-plugin-device cordova-plugin-console cordova-plugin-whitelist cordova-plugin-splashscreen com.ionic.keyboard
```

- Now install the `cordova-background-geolocation` plugin

**[Premium Version](https://github.com/transistorsoft/cordova-background-geolocation.git)**

`$ cordova plugin add https://github.com/transistorsoft/cordova-background-geolocation.git`

**[Lite Version](https://github.com/transistorsoft/cordova-background-geolocation-lt)**

`$ cordova plugin add https://github.com/transistorsoft/cordova-background-geolocation-lt.git`

- Add your desired platform(s) and build.  That's it.

```
$ cordova platform add ios
$ cordova build ios

$ cordova platform add android
$ cordova build android
$ cordova run android
```

## Adding Geofences

The app implements a **longtap** event on the map.  Simply **tap & hold** the map to initiate adding a geofence.

![Tap-hold to add geofence](https://dl.dropboxusercontent.com/u/2319755/cordova-background-geolocaiton/screenshot-iphone5-add-geofence-framed.png)

Enter an `identifier`, `radius`, `notifyOnExit`, `notifyOnEntry`.


