# :large_blue_diamond: [Ionic 3] Cordova Background Geolocation &mdash; Demo

[![Google Play](https://dl.dropboxusercontent.com/s/80rf906x0fheb26/google-play-icon.png?dl=1)](https://play.google.com/store/apps/details?id=com.transistorsoft.backgroundgeolocation.ionic2)

Fully-featured [Ionic](http://ionicframework.com/)-based sample-application for [Cordova Background Geolocation](http://shop.transistorsoft.com/pages/cordova-background-geolocation-premium)

![Home](https://dl.dropboxusercontent.com/s/byaayezphkwn36h/home-framed-350.png?dl=1)
![Settings](https://dl.dropboxusercontent.com/s/8lvnpp0gowitagq/settings-framed-350.png?dl=1)

## :large_blue_diamond: Installation

### Step 1: Start by cloning this repo

```bash
$ git clone https://github.com/transistorsoft/cordova-background-geolocation-SampleApp.git
```

----------------------------------------------------------------------------

### Step 2:  Building and Running the Ionic 3 App

```bash
$ npm install

$ npm install -g cordova ionic # you should have ionic and cordova installed

$ ionic cordova prepare android
$ ionic cordova run android --device

$ ionic cordova prepare ios
$ ionic cordova run ios --emulator
// opens a web console which receives all your locations
$ npm run open  
```

The quickest way to see the plugin in-action is to boot the **iOS** simulator and *simulate location* with *Freeway Drive*.

The demo is composed of three separate and indpendant sub-applications implemented as Ionic page-modules.

- [Hello World](./src/pages/hello-world/hello-world.ts)
- [Simple Map](./src/pages/simple-map/simple-map.ts)
- [Advanced](./src/pages/advanced) with complex settings screen and geofencing.

![](https://dl.dropboxusercontent.com/s/w87uylrgij9kd7r/ionic-demo-home.png?dl=1)

## :large_blue_diamond: Tracking Server

The demo app is configured to post locations to Transistor Software's demo server, which hosts a web-application for visualizing and filtering your tracking on a map.

- After booting the app the first time, you'll be asked to enter a **unique** "Tracking Server Username" (eg: Github username) so the plugin can post locations to `tracker.transistorsoft.com`.  

:warning: Make your username **unique** and known only to *you* &mdash; if every one uses *"test"*, you'll never find your device!)

![](https://dl.dropboxusercontent.com/s/yhb311q5shxri36/ionic-demo-username.png?dl=1)

- You can view the plugin's tracking history by visiting [http://tracker.transistorsoft.com/username](http://tracker.transistorsoft.com/username).

![](https://dl.dropboxusercontent.com/s/1a4far51w70rjvj/Screenshot%202017-08-16%2011.34.43.png?dl=1)

## :large_blue_diamond: Debug Mode

The plugin has a `debug` mode for field-testing.  The plugin will emit sounds during its life-cycle events:

| Event | iOS | Android |
|-------|-----|---------|
| Exit stationary-region | Dee-do Dee-do...Dee-do Dee-do | n/a |
| Location recorded | SMS-sent sound | "blip" |
| Aggressive geolocation engaged | SIRI listening sound | "doodly-doo" |
| Acquiring location | "tick, tick, tick" | dial-tone sound |
| Stationary state | "bloom" | long "beeeeeeep" |
| Geofence crossing | trumpets/fanfare | beep-beep-beep |

**NOTE:**  In order for debug sounds to operate *when the app is in background*, you must enable the `Audio and Airplay` **Background Mode**.

![](https://dl.dropboxusercontent.com/s/fl7exx3g8whot9f/enable-background-audio.png?dl=1)

## :large_blue_diamond: Adding Geofences

The **Advanced** app implements a **longtap** event on the map.  Simply **tap & hold** the map to initiate adding a geofence.

![Tap-hold to add geofence](https://dl.dropboxusercontent.com/s/vpyc1fr66q4sixy/screenshot-add-geofence.png?dl=1)

Enter an `identifier`, `radius`, `notifyOnExit`, `notifyOnEntry`.


