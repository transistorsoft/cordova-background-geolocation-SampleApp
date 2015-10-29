#!/bin/sh
echo "- Reset"
cordova platform remove ios && cordova platform remove android && cordova plugin remove com.transistorsoft.cordova.background-geolocation && cordova plugin add ../cordova-background-geolocation


