# Cordova Background Geolocation Sample Application

Fully-featured, [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation  (Premium Version)](http://christocracy.github.io/cordova-background-geolocation/)

## Installation

1. Start by cloning this repo
```
$ git clone https://github.com/christocracy/cordova-background-geolocation-SampleApp.git
```

2. Now we must install the application's required plugins.  Copy/paste the following one-liner into your console to install all the required plugins.
```
$ cordova plugin add cordova-plugin-device cordova-plugin-console cordova-plugin-whitelist cordova-plugin-splashscreen com.ionic.keyboard https://github.com/christocracy/cordova-background-geolocation.git#edge
```

3.  Add your desired platform(s) and build.  That's it.
```
$ cordova platforom add ios
$ cordova build ios

$ cordova platform add android
$ cordova build android
$ cordova run android
```
