# Cordova Background Geolocation &mdash; Sample Application

![Google Play](http://christocracy.github.io/cordova-background-geolocation/assets/images/google-play-icon.png)


Fully-featured, [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation  (Premium Version)](http://christocracy.github.io/cordova-background-geolocation/)
![SampleApp home](https://www.dropbox.com/s/609iibr6ofzoq7p/Screenshot%202015-06-06%2017.05.33.png?dl=1)

Edit settings and observe the behavour of **Background Geolocation** changing in **real time**.
![Settings Screen](https://www.dropbox.com/s/v6xwp6leuc5ysv9/Screenshot%202015-06-06%2019.08.58.png?dl=1)

## Installation

- Start by cloning this repo

```
$ git clone https://github.com/christocracy/cordova-background-geolocation-SampleApp.git
```

- Now we must install the application's required plugins.  Copy/paste the following one-liner into your console to install all the required plugins.

```
$ cordova plugin add cordova-plugin-device cordova-plugin-console cordova-plugin-whitelist cordova-plugin-splashscreen com.ionic.keyboard https://github.com/christocracy/cordova-background-geolocation.git#edge
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


