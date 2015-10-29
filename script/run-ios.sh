#!/bin/sh
echo "- rebuilding"
cordova platform remove ios && cordova plugin remove com.transistorsoft.cordova.background-geolocation && cordova plugin add ../cordova-background-geolocation && cordova platform add ios
cp BG\ Geo-Info.plist platforms/ios/BG\ Geo/BG\ Geo-Info.plist
open -a Xcode platforms/ios/BG\ Geo.xcodeproj


