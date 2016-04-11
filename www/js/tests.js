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
      

    }
  }
})();

