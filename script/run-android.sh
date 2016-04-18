#!/bin/sh
echo "- rebuilding"
cordova plugin remove com.transistorsoft.cordova.background-geolocation && cordova plugin add ../cordova-background-geolocation && cordova run android --device

echo "- Copying AndroidManifest"
cp AndroidManifest.xml platforms/android/AndroidManifest.xml

echo "- Launching Android Studio"
mkdir ./platforms/android/.idea
studio ./platforms/android

