# Cordova Background Geolocation Sample Application

Fully-featured, [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation  (Premium Version)](http://christocracy.github.io/cordova-background-geolocation/)

## Home Screen
![SampleApp home](https://www.dropbox.com/s/41gbtut47gk2exi/Screenshot%202015-06-06%2012.19.03.png?dl=1&width=300)

## Settings Screen
![Android Battery Performance](https://www.dropbox.com/s/wnr67qg4n0py77z/Screenshot%202015-06-06%2012.24.23.png?dl=1)

## Installation

(1) Start by cloning this repo

```
$ git clone https://github.com/christocracy/cordova-background-geolocation-SampleApp.git
```

(2) Now we must install the application's required plugins.  Copy/paste the following one-liner into your console to install all the required plugins.

```
$ cordova plugin add cordova-plugin-device cordova-plugin-console cordova-plugin-whitelist cordova-plugin-splashscreen com.ionic.keyboard https://github.com/christocracy/cordova-background-geolocation.git#edge
```

(3)  Add your desired platform(s) and build.  That's it.

```
$ cordova platform add ios
$ cordova build ios

$ cordova platform add android
$ cordova build android
$ cordova run android
```

## Adding Geofences

The app implements a **longtap** event on the map.  Simply **tap & hold** the map to initiate adding a geofence.

![Tap-hold to add geofence](/resources/tap-hold-add-geofence.jpg "Tap-hold to add geofence")

Enter an `identifier`, `radius`, `notifyOnExit`, `notifyOnEntry`.

![Add geofence](/resources/add-geofence.jpg "Add geofence")

