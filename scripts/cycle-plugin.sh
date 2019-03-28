#!/bin/sh

PLUGIN="cordova-background-geolocation"

if [[ -n $1 ]]; then
  WHICH="cordova-background-geolocation-lt"
fi

cordova plugin remove $PLUGIN  --nosave
ionic cordova plugin add $PLUGIN

