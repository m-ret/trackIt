angular.module('MyApp')
  .factory('Auth', function($http, $location, $rootScope, $alert, $window) {
    var token = $window.localStorage.token;
    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      $rootScope.currentUser = payload.user;      
    }

    // This is called with the results from from FB.getLoginStatus().
    function statusChangeCallback(response) {
      console.log('statusChangeCallback');
      console.log(response);
      // The response object is returned with a status field that lets the
      // app know the current login status of the person.
      // Full docs on the response object can be found in the documentation
      // for FB.getLoginStatus().
      if (response.status === 'connected') {
        // Logged into your app and Facebook.
        testAPI();
      } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
          console.log('Please log into this app.');
      } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
          console.log('Please log into Facebook.');
      }
    }

    // This function is called when someone finishes with the Login
    // Button.  See the onlogin handler attached to it in the sample
    // code below.
    function checkLoginState() {
      FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
      });
    }

    // Asynchronously initialize Facebook SDK
    $window.fbAsyncInit = function() {
      FB.init({
        appId: '624059410963642',
        responseType: 'token',        
        // checking if these are necessary //
        status: true, 
        cookie: true, 
        xfbml: true,
        ////////////////////////////////////
        version: 'v2.4'
      });

      // Now that we've initialized the JavaScript SDK, we call 
      // FB.getLoginStatus().  This function gets the state of the
      // person visiting this page and can return one of three states to
      // the callback you provide.  They can be:
      //
      // 1. Logged into your app ('connected')
      // 2. Logged into Facebook, but not your app ('not_authorized')
      // 3. Not logged into Facebook and can't tell if they are logged into
      //    your app or not.
      //
      // These three cases are handled in the callback function.

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

    // Asynchronously load Google+ SDK
    (function() {
      var po = document.createElement('script');
      po.type = 'text/javascript';
      po.async = true;
      po.src = 'https://apis.google.com/js/client:plusone.js';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(po, s);
    })();

    function testAPI() {
      console.log('Welcome!  Fetching your information.... ');
      FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        console.log('Thanks for logging in, ' + response.name + '!');
      });
    }

    return {
      facebookLogin: function() {
        FB.login(function(response) {
          FB.api('/me', function(profile) {
          $rootScope.profile = profile;
            var data = {
              signedRequest: response.authResponse.signedRequest,
              profile: profile
            };

            checkLoginState();            

            $http.post('/auth/facebook', data)
            .success(function(token) {
              var payload = JSON.parse($window.atob(token.split('.')[1]));
              $window.localStorage.token = token;
              $rootScope.currentUser = payload.user;              
              console.log($rootScope.currentUser);
              $location.path('/');
              $alert({
                title: 'Cheers!',
                content: 'You have successfully signed-in with Facebook.',
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
            })
          })
        }, { scope: 'email, public_profile' });
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
              content: 'You have successfully logged in.',
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
        $alert({
          content: 'You have been logged out.',
          animation: 'fadeZoomFadeDown',
          type: 'material',
          duration: 3
        });
        $location.path('/login');
      }
    };
  });