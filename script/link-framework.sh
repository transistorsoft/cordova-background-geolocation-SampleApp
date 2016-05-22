#!/bin/sh
rm -rf platforms/ios/BG\ Geo/Plugins/com.transistorsoft.cordova.background-geolocation/TSLocationManager.framework
ln -s ~/workspace/cordova/background-geolocation/cordova-background-geolocation/src/ios/TSLocationManager.framework ./platforms/ios/BG\ Geo/Plugins/com.transistorsoft.cordova.background-geolocation/TSLocationManager.framework

