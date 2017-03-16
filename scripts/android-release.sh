#!/bin/sh
cd ..
cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Dropbox/TransistorSoftware/transistorsoft-mobileapps.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk transistorsoft-mobileapps
/Applications/Dev/sdk/build-tools/22.0.1/zipalign  -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/outputs/apk/cordova-background-geolocation.apk
