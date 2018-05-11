#!/bin/sh
rm -rf platforms/ios/BG\ Geo/Plugins/cordova-background-geolocation/TSLocationManager.framework
ln -s ~/workspace/cordova/background-geolocation/cordova-background-geolocation/src/ios/TSLocationManager.framework ./platforms/ios/BG\ Geo/Plugins/cordova-background-geolocation/TSLocationManager.framework

rm -rf platforms/android/src/android/libs
ln -s ~/workspace/cordova/background-geolocation/cordova-background-geolocation/src/android/libs platforms/android/src/android
