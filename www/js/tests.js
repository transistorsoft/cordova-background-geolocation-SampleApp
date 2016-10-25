var Tests = (function() {
  var getLocationsTask = null;
  var getCurrentPositionTask = null;

  return {
    startSqliteTest: function(delay) {
      var bg = window.BackgroundGeolocation;

      getLocationsTask = setInterval(function() {
        bg.getLocations(function(rs, tid) {
          console.log('- getLocations: ', rs.length);
          bg.finish(tid);
        })
      }, delay);

      getCurrentPositionTask = setInterval(function() {
        bg.getCurrentPosition(function(location, tid) {
          console.log('- getCurrentPosition');
          bg.finish(tid);
        });
      }, delay);
    },
    stopSqliteTest: function() {
      clearInterval(getLocationsTask);
      clearInterval(getCurrentPositionTask);
    },
    addGeofenceTest: function(length, prefix, success, failure) {
      var bg = window.BackgroundGeolocation;
      prefix = prefix || 'default';
      bg.getCurrentPosition(function(location, taskId) {
        for (var n=0;n<length;n++) {
          bg.addGeofence({
            notifyOnExit: true,
            notifyOnEntry: true,
            identifier: 'geofence_' + prefix + '_' + n,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            radius: 200
          }, success, failure);
        }
        bg.finish(taskId);
      });
    },
    addGeofencesTest: function(length, prefix, success, failure) {
      prefix = prefix || 'default';
      var bg = window.BackgroundGeolocation;
      var rs = [];
      bg.getCurrentPosition(function(location, taskId) {
        for (var n=0;n<length;n++) {
          rs.push({
            notifyOnExit: true,
            notifyOnEntry: true,
            identifier: 'geofence_' + prefix + '_' + n,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            radius: 200
          });
        }
        bg.addGeofences(rs, success, failure);
        bg.finish(taskId);
      });
    },
    removeGeofencesTest: function(success, failure) {
      var bg = window.BackgroundGeolocation;
      this.addGeofencesTest('remove_test', function() {
        bg.getGeofences(function(rs) {
          console.info('- getGeofences: ', rs.length);

          bg.removeGeofences(function(response) {
            console.log('- Success: ', response);
            bg.getGeofences(function(rs) {
              console.log('- removeGeofences: ', rs.length);
            });
          }, function(error) {
            console.warn('- Error: ', error);
          });
        });
      });
    },
    insertLocations: function(length, success, failure) {
      var bg = window.BackgroundGeolocation;
      var n = 0;
      bg.getCurrentPosition(function(l, t) {
        for (var i=0;i<length;i++) {
          bg.insertLocation({
            coords: {
              latitude: l.coords.latitude,
              longitude: l.coords.longitude
            },
            timestamp: l.timestamp,
            uuid: 'uuid-' + i
          }, success, failure);
        }
      });
    },
    startGeofenceTest: function() {
      var geofences = [{
        identifier: "Geofence 1",
        notifyOnEntry: true,
        notifyOnExit: true,
        radius: 200,
        latitude: 45.5248868,
        longitude:  -73.6424362
      }, {
        identifier: "Geofence 2",
        notifyOnEntry: true,
        notifyOnExit: true,
        radius: 200,
        latitude: 45.5225079,
        longitude:  -73.6341922
      }, {
        identifier: "Geofence 3",
        notifyOnEntry: true,
        notifyOnExit: true,
        radius: 200,
        latitude: 45.5207131,
        longitude:  -73.6279527
      }]

      var result = {
        total: 0,
        ENTER: 0,
        EXIT: 0
      };

      var bg = window.BackgroundGeolocation;

      bg.removeGeofences();
      bg.addGeofences(geofences);
      bg.on('geofence', function(event, tid) {
        if (!result[event.action]) {
          result[event.action] = 0;
        }
        result[event.action]++;
        result.total++;
        console.log('- Geofence test: ', result);

        if (result.total === (2*geofences.count)) {
          if (result.ENTER === 3 && result.EXIT == 3) {
            bg.changePace(false);
            alert('Geofence test SUCCESS');
            console.info('Geofence test success: ', result);
          }
        }

      });
      bg.stop();
      bg.start(function() {
        bg.changePace(true);  
      });
    },
    /**
    * Auto-build a scheule based upon current time.
    *                ______________..._______________                      ___...
    * ______________|                                |____________________|
    * |<-- delay -->|<---------- duration ---------->|<---- interval ---->|<-- duration -->
    *
    * @param {Integer} count How many schedules to generate?
    * @param {Integer} delay How many minutes in future to start generating schedules
    * @param {Integer} duration How long is each trigger event
    * @param {Integer} interval How long between trigger events
    */
    generateSchedule: function(count, delay, duration, interval) {
      // Start 2min from now
      var now = new Date();
      var start = new Date(now.getTime() + delay*60000);

      var rs = [];
      for (var n=0,len=count;n<len;n++) {
        var end = new Date(start.getTime() + duration*60000);
        var schedule = '1-7 ' + start.getHours()+':'+start.getMinutes() + '-' + end.getHours()+':'+end.getMinutes();
        start = new Date(end.getTime() + interval*60000);
        rs.push(schedule);
      }
      return rs;
    },

    createGeofences(data, interval, params, callback) {
      var bgGeo = window.BackgroundGeolocation;
      bgGeo.removeGeofences();

      interval = interval || 1;
      params = params || {notifyOnEntry: true};
      params.notifyOnEntry  = params.notifyOnEntry  || false;
      params.notifyOnExit   = params.notifyOnExit   || false;
      params.notifyOnDwell  = params.notifyOnDwell  || false;
      var geofences = [];
      var index = 1;
      for (var n=0,len=data.length;n<len;n++) {
        if (n % interval) { continue; }
        geofences.push({
          identifier: 'geofences_test_' + index++,
          latitude: data[n].lat,
          longitude: data[n].lng,
          radius: 200,
          notifyOnExit: params.notifyOnExit,
          notifyOnEntry: params.notifyOnEntry,
          notifyOnDwell: params.notifyOnDwell
        });
      };
      bgGeo.addGeofences(geofences, function(result) {
        console.log('Geofences loaded');
        callback();
      }, function(error) {
        console.warn('Geofence load failure: ', error);
        callback();
      });
    },

    crudTest: function() {
      console.log("******************************");
      console.log("* Crud test");
      console.log("******************************");
      var bgGeo = window.BackgroundGeolocation;
      bgGeo.setConfig({autoSync: false});

      bgGeo.getCurrentPosition(function(location, taskId) {
        bgGeo.getLocations(function(rs, tid) {
          if (!rs.length) {
            console.warn("- getLocations FAIL: ", rs.length);
            return;
          }
          var uuid = rs[0].uuid;
          console.log("- uuid: ", uuid);

          bgGeo.getCount(function(count) {
            console.log('- Count BEFORE: ', count);
          });
          var params = {
            coords: location.coords,
            extras: {foo: 'insertLocation without timestamp'}
          };
          bgGeo.insertLocation(params, function() {
            console.log('- INSERT location without timetamp');
          }, function(error) {
            console.log('- INSERT FAILED: ', error);
          });
          bgGeo.getLocation(uuid, function(location) {
            console.log('- getLocation SUCCESS: ', JSON.stringify(location, null, 2));
              location.extras = {"CRUD_TEST":"------------ CrudTest updateLocation ---------------"};
              bgGeo.updateLocation(location, function() {
                console.log('- Update location SUCCESS');
                bgGeo.getLocation(uuid, function(l) {
                  console.log('- Get Location after UPDATE: ', JSON.stringify(l, null, 2));

                  bgGeo.destroyLocation(uuid, function() {
                    console.log('- Destroy Location SUCCESS', uuid);
                    bgGeo.getCount(function(count) {
                      console.log('- Count: ', count);
                    });
                    bgGeo.getLocation(uuid, function() {
                      console.warn('- Get Location should not SUCCEED!');
                    }, function() {
                      console.log('- GOOD: getLocation failed after destroy');
                    });
                  }, function(error) {
                    console.warn('- Destroy Location FAILURE: ', uuid);
                  });
                }, function(error) {
                  console.warn('- Get Location FAILED: ', error);
                })
              }, function(error) {
                console.log('- Update location FAILURE: ', error);
              });
          }, function(error) {
            console.log('- Failed to find location; ', uuid);
          })
        });        
      }, {
        persist: true
      });
    }
  }
})();

