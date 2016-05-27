angular.module("MyApp")
  .factory("Search", function($resource) {
    return $resource("/api/search/:search", {}, {
      query : {
        method : "GET",
        isArray : true
      }
    });
});