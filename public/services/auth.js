angular.module('MyApp')
  .factory('Auth', function($http, $location, $rootScope, $q, $alert, $window) {
    var token = $window.localStorage.token;
    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      $rootScope.currentUser = payload.user;
    }
    // This is called with the results from from FB.getLoginStatus().
    function statusChangeCallback(response) {
      console.log('statusChangeCallback', response);
      // The response object is returned with a status field that lets the
      // app know the current login status of the person.
      // Full docs on the response object can be found in the documentation
      // for FB.getLoginStatus().
      if (response.status === 'connected') {
        // Logged into your app and Facebook.
        testAPI();
      } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        console.log({'status' : 'Please log into this app.'});
      } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        console.log({'status' : 'Please log into Facebook.'});
      }
    };

    function checkLoginState() {
      FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });
    };

    // Asynchronously initialize Facebook SDK
    $window.fbAsyncInit = function() {
      FB.init({
        appId : '624059410963642',
        responseType : 'token',
        status : true,
        cookie : true,
        xfbml : true,
        version : 'v2.4'
      });

      FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });
    };

    // Asynchronously load Facebook SDK
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    // Here we run a very simple test of the Graph API after login is
    // successful.  See statusChangeCallback() for when this call is made.
    function testAPI() {
      console.log('Welcome!  Fetching your information.... ');
      FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        console.log({'status' : 'Thanks for logging in, ' + response.name + '!'});
      });
    }

    // Asynchronously load Google+ SDK
    (function() {
      var po = document.createElement('script');
      po.type = 'text/javascript';
      po.async = true;
      po.src = 'https://apis.google.com/js/client:plusone.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
    })();

    return {
      facebookLogin: function() {
        var deferred = $q.defer();
        FB.login(function(response) {
          FB.api('/me', {fields: 'name, first_name, last_name, picture,email'}, function(profile) {
            deferred.resolve(profile);
            var data = {
              signedRequest: response.authResponse.signedRequest,
              profile: profile
            };
            $rootScope.profPic = profile.picture.data.url;
            // checkLoginState();
            return $http.post('/auth/facebook', data)
              .success(function(token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                $window.localStorage.token = token;
                $rootScope.currentUser = payload.user;
                $location.path('/');
                $alert({
                  title: 'Cheers!',
                  content: 'You have successfully signed-in with Facebook.',
                  animation: 'fadeZoomFadeDown',
                  type: 'material',
                  duration: 3
                });
              });
          });
        }, { scope: 'email, public_profile' });
        return deferred.promise;
      },
      googleLogin: function() {
        gapi.auth.authorize({
          client_id: '55262601920-5jhf3qth89okujq6a7lh8bqc9epr8475.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read',
          immediate: false
        }, function(token) {
          gapi.client.load('plus', 'v1', function() {
            var request = gapi.client.plus.people.get({
              userId: 'me'
            });
            request.execute(function(authData) {
              $http.post('/auth/google', { profile: authData }).success(function(token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                $window.localStorage.token = token;
                $rootScope.currentUser = payload.user;
                $location.path('/');
                $alert({
                  title: 'Cheers!',
                  content: 'You have successfully signed-in with Google.',
                  animation: 'fadeZoomFadeDown',
                  type: 'material',
                  duration: 3
                });
              });
            });
          });
        });
      },
      login: function(user) {
        return $http.post('/auth/login', user)
          .success(function(data) {
            $window.localStorage.token = data.token;
            var payload = JSON.parse($window.atob(data.token.split('.')[1]));
            $rootScope.currentUser = payload.user;
            $location.path('/');
            $alert({
              title: 'Cheers!',
              content: 'You have successfully logged in',
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          })
          .error(function() {
            delete $window.localStorage.token;
            $alert({
              title: 'Error!',
              content: 'Invalid username or password.',
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          });
      },
      signup: function(user) {
        return $http.post('/auth/signup', user)
          .success(function() {
            $location.path('/login');
            $alert({
              title: 'Congratulations!',
              content: 'Your account has been created.',
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          })
          .error(function(response) {
            $alert({
              title: 'Error!',
              content: response.data,
              animation: 'fadeZoomFadeDown',
              type: 'material',
              duration: 3
            });
          });
      },
      logout: function() {
        delete $window.localStorage.token;
        $rootScope.currentUser = null;
        $location.path('/login');
        $alert({
          content: 'You have been logged out.',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 3
        });
      }
    };
  });