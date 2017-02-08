#!/bin/sh
rm -rf platforms/ios/BG\ Geo/Plugins/cordova-background-geolocation/TSLocationManager.framework
ln -s ~/workspace/cordova/background-geolocation/cordova-background-geolocation/src/ios/TSLocationManager.framework ./platforms/ios/BG\ Geo/Plugins/cordova-background-geolocation/TSLocationManager.framework

rm platforms/android/src/android/libs/tslocationmanager.aar
ln -s ~/workspace/cordova/background-geolocation/cordova-background-geolocation/src/android/libs/tslocationmanager.aar platforms/android/src/android/libs/tslocationmanager.aar
