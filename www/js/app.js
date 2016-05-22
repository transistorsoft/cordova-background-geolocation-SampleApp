var app = angular.module('starter', ['ionic', 'starter.Home', 'starter.Settings', 'services.Settings']);

app.config(function($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'js/app/home/home.html',
      controller: 'Home'
    })    
    .state('getSettings', {
      url: '/getSettings',
      controller: 'Settings'
    })
    .state('settings', {
      url: '/settings',
      templateUrl: 'js/app/settings/settings.html',
      controller: 'Settings',
      cache: false
    })
    .state('settings/distanceFilter', {
      url: '/settings/distanceFilter',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/stationaryRadius', {
      url: '/settings/stationaryRadius',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/desiredAccuracy', {
      url: '/settings/desiredAccuracy',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/activityType', {
      url: '/settings/activityType',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/triggerActivities', {
      url: '/settings/triggerActivities',
      templateUrl: 'js/app/settings/trigger-activities.html',
      controller: 'Settings'
    })
    .state('settings/disableElasticity', {
      url: '/settings/disableElasticity',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/url', {
      url: '/settings/url',
      templateUrl: 'js/app/settings/url.html',
      controller: 'Settings'
    })
    .state('settings/method', {
      url: '/settings/method',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/autoSync', {
      url: '/settings/autoSync',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/batchSync', {
      url: '/settings/batchSync',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/locationUpdateInterval', {
      url: '/settings/locationUpdateInterval',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/fastestLocationUpdateInterval', {
      url: '/settings/fastestLocationUpdateInterval',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/activityRecognitionInterval', {
      url: '/settings/activityRecognitionInterval',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/stopDetectionDelay', {
      url: '/settings/stopDetectionDelay',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/stopTimeout', {
      url: '/settings/stopTimeout',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/stopOnTerminate', {
      url: '/settings/stopOnTerminate',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/forceReloadOnLocationChange', {
      url: '/settings/forceReloadOnLocationChange',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/forceReloadOnMotionChange', {
      url: '/settings/forceReloadOnMotionChange',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/forceReloadOnGeofence', {
      url: '/settings/forceReloadOnGeofence',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/startOnBoot', {
      url: '/settings/startOnBoot',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/debug', {
      url: '/settings/debug',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/preventSuspend', {
      url: '/settings/preventSuspend',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/heartbeatInterval', {
      url: '/settings/heartbeatInterval',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/foregroundService', {
      url: '/settings/foregroundService',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/deferTime', {
      url: '/settings/deferTime',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/pausesLocationUpdatesAutomatically', {
      url: '/settings/pausesLocationUpdatesAutomatically',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/useSignificantChangesOnly', {
      url: '/settings/useSignificantChangesOnly',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
    .state('settings/disableMotionActivityUpdates', {
      url: '/settings/disableMotionActivityUpdates',
      templateUrl: 'js/app/settings/radio-list.html',
      controller: 'Settings'
    })
});

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
