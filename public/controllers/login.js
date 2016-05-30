angular.module('MyApp')
  .controller('LoginCtrl', function($scope, $rootScope, Auth) {

    $scope.login = function() {
      Auth.login({ email: $scope.email, password: $scope.password });
    };

    $scope.facebookLogin = function() {
      Auth.facebookLogin()
        .then(function(profile) {
          $scope.profile = profile;
        })
    };

    $scope.googleLogin = function() {
      Auth.googleLogin();
    };

    $scope.pageClass = 'fadeZoom';
  });