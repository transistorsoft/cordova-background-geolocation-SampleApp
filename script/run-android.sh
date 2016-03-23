#!/bin/sh
echo "- rebuilding"
cordova plugin remove com.transistorsoft.cordova.background-geolocation && cordova plugin add ../cordova-background-geolocation && cordova run android --device
cp AndroidManifest.xml platforms/android/AndroidManifest.xml