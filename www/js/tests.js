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
    }
  }
})();

