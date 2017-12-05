#!/bin/sh
ionic cordova build android --release --prod
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Dropbox/TransistorSoftware/Apps/com.transistorsoft.backgroundgeolocation.ionic2/release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk com.transistorsoft.backgroundgeolocation.ionic2
~/Library/Android/sdk/build-tools/26.0.1/zipalign  -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk ./cordova-background-geolocation.apk
