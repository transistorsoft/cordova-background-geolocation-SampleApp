var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.directives', 'ngIOS9UIWebViewPatch']);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'Maps'
    })
    .state('getSettings', {
      url: '/getSettings',
      controller: 'Settings'
    })
    .state('settings', {
      url: '/settings',
      templateUrl: 'templates/settings.html',
      controller: 'Settings',
      cache: false
    })
    .state('settings/distanceFilter', {
      url: '/settings/distanceFilter',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/stationaryRadius', {
      url: '/settings/stationaryRadius',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/desiredAccuracy', {
      url: '/settings/desiredAccuracy',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/activityType', {
      url: '/settings/activityType',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/triggerActivities', {
      url: '/settings/triggerActivities',
      templateUrl: 'templates/settings/trigger-activities.html',
      controller: 'Settings'
    })
    .state('settings/disableElasticity', {
      url: '/settings/disableElasticity',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/url', {
      url: '/settings/url',
      templateUrl: 'templates/settings/url.html',
      controller: 'Settings'
    })
    .state('settings/method', {
      url: '/settings/method',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/autoSync', {
      url: '/settings/autoSync',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/batchSync', {
      url: '/settings/batchSync',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/locationUpdateInterval', {
      url: '/settings/locationUpdateInterval',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/fastestLocationUpdateInterval', {
      url: '/settings/fastestLocationUpdateInterval',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/activityRecognitionInterval', {
      url: '/settings/activityRecognitionInterval',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/stopTimeout', {
      url: '/settings/stopTimeout',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/stopOnTerminate', {
      url: '/settings/stopOnTerminate',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/forceReloadOnLocationChange', {
      url: '/settings/forceReloadOnLocationChange',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/forceReloadOnMotionChange', {
      url: '/settings/forceReloadOnMotionChange',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/forceReloadOnGeofence', {
      url: '/settings/forceReloadOnGeofence',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/startOnBoot', {
      url: '/settings/startOnBoot',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/debug', {
      url: '/settings/debug',
      templateUrl: 'templates/settings/radio-list.html',
      controller: 'Settings'
    })
});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    if (window.cordova) {
      if (window.BackgroundGeolocation) {
        BackgroundGeolocationService.configurePlugin(window.BackgroundGeolocation);
      }
    }
  });
})
