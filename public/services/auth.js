angular.module('MyApp').factory('Auth', function($http, $location, $rootScope, $alert, $window) {
  /**
   * @param {Object} message
   * @return {undefined}
   */
  function onMessage(message) {
    console.log('statusChangeCallback');
    console.log(message);
    if ('connected' === message.status) {
      getInfo();
    } else {
      if ('not_authorized' === message.status) {
        console.log('Please log into this app.');
      } else {
        console.log('Please log into Facebook.');
      }
    }
  }
  /**
   * @return {undefined}
   */
  function constructor() {
    FB.getLoginStatus(function(msg) {
      onMessage(msg);
    });
  }
  /**
   * @return {undefined}
   */
  function getInfo() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(unused) {
      console.log('Successful login for: ' + unused.name);
      console.log('Thanks for logging in, ' + unused.name + '!');
    });
  }
  var start = $window.localStorage.token;
  if (start) {
    /** @type {*} */
    var data = JSON.parse($window.atob(start.split('.')[1]));
    $rootScope.currentUser = data.user;
  }
  return $window.fbAsyncInit = function() {
    FB.init({
      appId : '624059410963642',
      responseType : 'token',
      status : true,
      cookie : true,
      xfbml : true,
      version : 'v2.4'
    });
    FB.getLoginStatus(function(msg) {
      onMessage(msg);
    });
  }, function(d, el, id) {
    var element;
    var insertAt = d.getElementsByTagName(el)[0];
    if (!d.getElementById(id)) {
      /** @type {Element} */
      element = d.createElement(el);
      /** @type {string} */
      element.id = id;
      /** @type {string} */
      element.src = '//connect.facebook.net/en_US/sdk.js';
      insertAt.parentNode.insertBefore(element, insertAt);
    }
  }(document, 'script', 'facebook-jssdk'), function() {
    /** @type {Element} */
    var ga = document.createElement('script');
    /** @type {string} */
    ga.type = 'text/javascript';
    /** @type {boolean} */
    ga.async = true;
    /** @type {string} */
    ga.src = 'https://apis.google.com/js/client:plusone.js';
    var insertAt = document.getElementsByTagName('script')[0];
    insertAt.parentNode.insertBefore(ga, insertAt);
  }(), {
    /**
     * @return {undefined}
     */
    facebookLogin : function() {
      FB.login(function(info) {
        FB.api('/me', function(profile) {
          /** @type {string} */
          $rootScope.profile = profile;
          var user = {
            signedRequest : info.authResponse.signedRequest,
            profile : profile
          };
          constructor();
          $http.post('/auth/facebook', user).success(function(token) {
            /** @type {*} */
            var data = JSON.parse($window.atob(token.split('.')[1]));
            /** @type {string} */
            $window.localStorage.token = token;
            $rootScope.currentUser = data.user;
            console.log($rootScope.currentUser);
            $location.path('/');
            $alert({
              title : 'Cheers!',
              content : 'You have successfully signed-in with Facebook.',
              animation : 'fadeZoomFadeDown',
              type : 'material',
              duration : 3
            });
          });
        });
      }, {
        scope : 'email, public_profile'
      });
    },
    /**
     * @return {undefined}
     */
    googleLogin : function() {
      gapi.auth.authorize({
        client_id : '55262601920-5jhf3qth89okujq6a7lh8bqc9epr8475.apps.googleusercontent.com',
        scope : 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/plus.profile.emails.read',
        immediate : false
      }, function(dataAndEvents) {
        gapi.client.load('plus', 'v1', function() {
          var suiteWithAfter = gapi.client.plus.people.get({
            userId : 'me'
          });
          suiteWithAfter.execute(function(profile) {
            $http.post('/auth/google', {
              profile : profile
            }).success(function(token) {
              /** @type {*} */
              var data = JSON.parse($window.atob(token.split('.')[1]));
              /** @type {string} */
              $window.localStorage.token = token;
              $rootScope.currentUser = data.user;
              $location.path('/');
              $alert({
                title : 'Cheers!',
                content : 'You have successfully signed-in with Google.',
                animation : 'fadeZoomFadeDown',
                type : 'material',
                duration : 3
              });
            });
          });
        });
      });
    },
    /**
     * @param {Function} user
     * @return {?}
     */
    login : function(user) {
      return $http.post('/auth/login', user).success(function(data) {
        $window.localStorage.token = data.token;
        /** @type {*} */
        var results = JSON.parse($window.atob(data.token.split('.')[1]));
        $rootScope.currentUser = results.user;
        $location.path('/');
        $alert({
          title : 'Cheers!',
          content : 'You have successfully logged in.',
          animation : 'fadeZoomFadeDown',
          type : 'material',
          duration : 3
        });
      }).error(function() {
        delete $window.localStorage.token;
        $alert({
          title : 'Error!',
          content : 'Invalid username or password.',
          animation : 'fadeZoomFadeDown',
          type : 'material',
          duration : 3
        });
      });
    },
    /**
     * @param {?} data
     * @return {?}
     */
    signup : function(data) {
      return $http.post('/auth/signup', data).success(function() {
        $location.path('/login');
        $alert({
          title : 'Congratulations!',
          content : 'Your account has been created.',
          animation : 'fadeZoomFadeDown',
          type : 'material',
          duration : 3
        });
      }).error(function(event) {
        $alert({
          title : 'Error!',
          content : event.data,
          animation : 'fadeZoomFadeDown',
          type : 'material',
          duration : 3
        });
      });
    },
    /**
     * @return {undefined}
     */
    logout : function() {
      delete $window.localStorage.token;
      /** @type {null} */
      $rootScope.currentUser = null;
      $alert({
        content : 'You have been logged out.',
        animation : 'fadeZoomFadeDown',
        type : 'material',
        duration : 3
      });
      $location.path('/login');
    }
  };
});
