# Cordova Background Geolocation &mdash; Sample Application

<a href="market://details?id=com.transistorsoft.background_geolocation.ionic">


[![Google Play](http://christocracy.github.io/cordova-background-geolocation/assets/images/google-play-icon.png)](http://play.google.com/store/apps/details?id=com.transistorsoft.background_geolocation.ionic)


Fully-featured, [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation  (Premium Version)](http://christocracy.github.io/cordova-background-geolocation/)

**NOTE** This SampleApp **REQUIRES** the Premium Version -- It will **not** work if you have not purchased the Premium Version.

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
$ cordova plugin add cordova-plugin-device cordova-plugin-console cordova-plugin-whitelist cordova-plugin-splashscreen com.ionic.keyboard https://github.com/transistorsoft/cordova-background-geolocation.git#edge
```

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

![Tap-hold to add geofence](https://www.dropbox.com/s/9qif3rvznwkbphd/Screenshot%202015-06-06%2017.12.41.png?dl=1)

Enter an `identifier`, `radius`, `notifyOnExit`, `notifyOnEntry`.


