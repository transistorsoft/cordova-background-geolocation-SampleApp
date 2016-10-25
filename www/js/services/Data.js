angular.module('services.Data', []).factory('Data', function($rootScope, $http) {
  var _host;

  function urlFor(route) {
    return 'data/' + route + '.json';
  }
  return {
    setHost: function(host) {
      _host = host;
    },
    getRoute: function(name, callback) {
      var data = [];
      $http.get(urlFor(name)).then(function(response) {
        if (response.status === 200) {
          callback(response.data);
        } else {
          console.error("Response: ", response.status, response.data);
        }
      });
    }
  }
});