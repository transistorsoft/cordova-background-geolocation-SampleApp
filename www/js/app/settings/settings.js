angular.module('starter.Settings', [])

.controller('Settings', function($scope, $ionicModal, $ionicLoading, $ionicPopup, $state, Settings) {
	
  $scope.syncButtonIcon = 'ion-load-c icon-animated';
  $scope.selectedValue  = '';
  $scope.isSyncing      = false;

  $scope.state = {
    email: window.localStorage.getItem('email-log-recipient'),
    debug: undefined
  };

  var bgGeo;

  ionic.Platform.ready(function() {
    if (!window.BackgroundGeolocation) { return;}
    bgGeo = window.BackgroundGeolocation;

    // Fetch current state of BackgroundGeolocation.  We want to set the state
    // of the Debug (  o) toggle button in top toolbar.
    bgGeo.getState(function(state) {
      $scope.$apply(function() {
        $scope.state.debug = JSON.parse(state.debug);
      });
    });
  });

  $scope.isAutoSyncDisabled = function() {
    return !$scope.isSyncing && Settings.getConfig().autoSync == 'true';
  }

  $scope.getSettings = function(group) {
    return Settings.getSettings(group);
  };

  $scope.getValue = function(name) {
    if (name === 'triggerActivities') {
      var value = Settings.getConfig()[name];
      var items = value.replace(/\s+/g, '').split(',');
      if (items.length == 5) {
        return 'ALL';
      } else {
        return value;
      }
    } else {
      return Settings.getConfig()[name];
    }
  };

  /**
  * Row-click handler
  */
  $scope.onSelectSetting = function() {
    $state.selectedSetting = this.setting;
    if (bgGeo) { bgGeo.playSound(Settings.getSoundId('BUTTON_CLICK')); }

    if (this.setting.name === 'triggerActivities') {
    
    }
    switch (this.setting.name) {
      case 'triggerActivities':
        $state.triggerActivities = {};
        var activities = $scope.getConfig().triggerActivities.replace(/\s+/g, '').split(',');
        var activity;
        for (var n=0,len=activities.length;n<len;n++) {
          activity = activities[n];
          $state.triggerActivities[activity] = true;
        }
        break;
    }
    switch (this.setting.inputType) {
      case 'select':
      case 'text':
        $state.go('settings/' + this.setting.name);
        break;
    }
  };

  /**
  * Select setting-value
  */
  $scope.onSelectValue = function() {
    if (bgGeo) {
      bgGeo.playSound(Settings.getSoundId('BUTTON_CLICK'));

      var config = {},
          name = $state.selectedSetting.name,
          value = this.value;

      config[name] = value;

      bgGeo.setConfig(config, function() {
        console.info('[js] setConfig success: ', name, value);
      }, function() {
        console.warn('[js] setConfig error: ', name, value);
      });
    }
    Settings.set(name, value);
    $state.autoSyncDisabled = !Settings.getConfig().autoSync;
    $state.go('settings');
  };

  $scope.onClickDone = function() {

    //BackgroundGeolocationService.set($state.selectedSetting.name, this.value);
    var config  = this.getConfig();
    var name    = $state.selectedSetting.name;
    var value   = config[name];

    switch (name) {
      case 'triggerActivities':
        var model = $state.triggerActivities;
        value = Object.keys(model).filter(function(key) {
          return (key.length > 0) && (model[key] === true);
        });
        value = value.length ? value.join(',') : '';
        break;      
    }
    Settings.set(name, value);

    var config = {}
    config[name] = value;

    bgGeo.setConfig(function() {
      console.log('[js] setConfig success');
    }, function() {
      console.warn('[js] setConfig failure');
    }, config);

    $state.go('settings');
  };

  $scope.getConfig = function() {
    return Settings.getConfig();
  };

  $scope.getSettingValues = function() {
    return $state.selectedSetting.values;
  };

  $scope.getSelectedSetting = function() {
    return $state.selectedSetting;
  };

  $scope.getTriggerActivities = function() {
    return $state.triggerActivities;
  };

  /**
  * Email application log to someone
  */
  $scope.onEmailLog = function() {
    var myPopup = $ionicPopup.show({
      template: '<input type="email" ng-model="state.email">',
      title: 'Email application logs',
      subTitle: 'Recipient email',
      scope: $scope,
      buttons: [{
        text: 'Cancel'
      },{
        text: '<b>Send</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.state.email) {
            e.preventDefault();
          } else {
            myPopup.close();
            // remember this email address
            window.localStorage.setItem('email-log-recipient', $scope.state.email);
            bgGeo.emailLog($scope.state.email);      
          }
        }
      }]
    });
  };

  $scope.onToggleDebug = function() {
    Settings.set('debug', $scope.state.debug);
    if (!bgGeo) { return;}

    bgGeo.setConfig(function() {
      console.log('[js] setConfig success');
    }, function() {
      console.log('[js] setConfig failure');
    }, {
      debug: Settings.get('debug')
    });
  }

  $scope.onClickSync = function() {
    if ($scope.isSyncing) { return false; }

    bgGeo.playSound(Settings.getSoundId('BUTTON_CLICK'));
    $scope.isSyncing = true;
    
    bgGeo.sync(function(rs, taskId) {
      console.info('[js] sync success: ', rs.length);
      bgGeo.playSound(Settings.getSoundId('MESSAGE_SENT'));
      $scope.$apply(function() {
        $scope.isSyncing = false;
      });
      bgGeo.finish(taskId);
    }, function(error) {
      console.warn('[js] sync error', error);
      window.alert(error);
      $scope.$apply(function() {
        $scope.isSyncing = false;
      })
    });
  };

});