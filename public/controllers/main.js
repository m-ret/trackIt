angular.module('MyApp').controller('MainCtrl', function($scope, $timeout, Show) {

  $scope.alphabet = ['0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  $scope.genres = ['Action', 'Adventure', 'Animation', 'Children', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Food', 'Home and Garden', 'Horror', 'Mini-Series', 'Mystery', 'News', 'Reality', 'Romance', 'Sci-Fi', 'Sport', 'Suspense', 'Talk Show', 'Thriller', 'Travel'];

  $scope.headingTitle = 'Top 12 Shows';
  $scope.shows = Show.query();

  $scope.order = function(options) {
    if (options.rating === null) {
      console.log(options);
      options.rating = 0;
    };

    return options.rating;
  };

  $scope.filterByGenre = function(keyId) {
    $scope.headingTitle = keyId;
    $scope.shows = Show.query({
      genre : keyId
    });

    $scope.noShows = false;
    if (!$scope.shows.length) {
      $timeout(function() {
        $scope.noShows = true;
      }, 2000);
    }
  };

  $scope.filterByAlphabet = function(keyId) {
    $scope.noShows = false;
    $scope.shows = Show.query({ alphabet : keyId });
    $scope.headingTitle = keyId;
    $scope.noShows = false;
    if (!$scope.shows.length) {
      $timeout(function() {
        $scope.noShows = true;
      }, 2000);
    }
  };

  $scope.removeFilter = function() {
    $scope.headingTitle = 'Top 12 Shows';
    $scope.noShows = false;
    $scope.shows = Show.query();
  };
});
