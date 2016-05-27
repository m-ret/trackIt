angular.module('MyApp')
  .controller('AddCtrl', function($scope, $alert, Show, Search) {
    $scope.adding = false;
    $scope.showName = '';
    $scope.data = {};
    $scope.addShowToModel = '';

    $scope.$watch('showName', function (tmpStr) {
      if (!tmpStr || tmpStr.length == 0) return 0;
        if (tmpStr === $scope.showName) {
          $scope.adding = true;
          Search.query({ 'search': $scope.showName })
            .$promise.then(function(data) {
              $scope.adding = false;
              $scope.responseData = data;
            })
            .catch(function(response) {
              $scope.adding = false;
              $alert({
                content: response.data.message,
                animation: 'fadeZoomFadeDown',
                type: 'material',
                duration: 3
              });
            });
        }
    });

    $scope.updateNgModel = function() {
      $scope.addShowToModel = {newShow: $scope.data.test[0]};
    }

    $scope.addShow = function() {
      $scope.adding = true;
      Show.save({ showName: $scope.addShowToModel.newShow }).$promise
        .then(function() {
          $scope.addForm.$setPristine();
          $alert({
            content: 'TV show has been added.',
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
          $scope.adding = false;
        })
        .catch(function(response) {
          $scope.adding = false;
          $scope.addForm.$setPristine();
          $alert({
            content: response.data.message,
            animation: 'fadeZoomFadeDown',
            type: 'material',
            duration: 3
          });
        });
    };
  });