#!/bin/sh
##
# Transistorsoft dev script.  This won't concern you.
#
# Links the installed plugin's tslocationmanager.aar / TSLocationManager.framework to the local build
# so we don't have to yarn add react-native-background-geolocation to test the libs.
#
PWD=$(pwd)
SRC_ROOT="/Volumes/Glyph2TB/Users/chris/workspace/cordova/background-geolocation"
MODULE_NAME="cordova-background-geolocation"
PUBLIC_MODULE_PATH="./node_modules/$MODULE_NAME-lt"
PRIVATE_MODULE_PATH="./node_modules/$MODULE_NAME"
ANDROID_LIBS_DIR="libs/com/transistorsoft/tslocationmanager"
IOS_LIBS_DIR=""
MODULE_PATH=""

if [ -d $PRIVATE_MODULE_PATH ]; then
    MODULE_PATH=$PRIVATE_MODULE_PATH
	IOS_LIBS_DIR="platforms/ios/BG\ Geo/Plugins/${MODULE_NAME}/TSLocationManager.xcframework"

else
    if [ -d $PUBLIC_MODULE_PATH ]; then
    	MODULE_PATH=$PUBLIC_MODULE_PATH
    	IOS_LIBS_DIR="platforms/ios/BG Geo/Plugins/${MODULE_NAME}-lt/TSLocationManager.xcframework"
    fi
fi

if [ -n "$MODULE_PATH" ]; then
	echo "- Found module: $MODULE_PATH"

	# destroy /android/libs
	rm -rf "platforms/android/app/${ANDROID_LIBS_DIR}"
	rm -rf "platforms/android/app/${ANDROID_LIBS_DIR}-reverse"

	# link it -> local repo.
	CMD="$SRC_ROOT/$MODULE_NAME/src/android/$ANDROID_LIBS_DIR platforms/android/app/$ANDROID_LIBS_DIR"
	ln -s $CMD
	echo "- [link android] ln -s $CMD"

	CMD="$SRC_ROOT/$MODULE_NAME/src/android/$ANDROID_LIBS_DIR-reverse platforms/android/app/$ANDROID_LIBS_DIR-reverse"
	ln -s $CMD
	echo "- [link android] ln -s $CMD"

	# destroy /ios/RNBackgroundGeolocation/TSLocationManager.framework
	rm -rf "$IOS_LIBS_DIR"
	CMD="$SRC_ROOT/$MODULE_NAME/src/ios/TSLocationManager.framework $IOS_LIBS_DIR"
	# link it -> local repo.
	eval ln -s $CMD
	echo "- [link ios] ln -s $CMD"
else
	echo "- ERROR could not find $PUBLIC_MODULE_PATH or $PRIVATE_MODULE_PATH"
fi
