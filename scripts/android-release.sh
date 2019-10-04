#!/bin/sh
ionic cordova build android --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Dropbox/TransistorSoftware/Apps/com.transistorsoft.backgroundgeolocation.ionic2/release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk com.transistorsoft.backgroundgeolocation.ionic2
~/Library/Android/sdk/build-tools/29.0.2/zipalign  -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ./cordova-background-geolocation.apk
