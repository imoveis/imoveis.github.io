var app = angular.module('myApp', []);

function getParam(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var params = url[i].split("=");
        if (params[0] == param)
            return params[1];
    }
    return false;
}
app.filter('myFilter', function() {
    return function(input, selectedCatCheckBox) {
        var selectedAnimals = [];

        //If none checked, show all.
        var anyChecked = false;
        for (var sel in selectedCatCheckBox) {
            if (selectedCatCheckBox[sel] === true) {
                anyChecked = true;
            }
        }
        if (!anyChecked) {
            return input;
        }

        for (var ani in input) {
            var spec = input[ani].gsx$status.$t;

            for (sel in selectedCatCheckBox) {
                if (sel == spec && selectedCatCheckBox[sel] === true) {
                    selectedAnimals.push(input[ani]);
                }
            }

        }
        return selectedAnimals;
    };
});
app.controller('SuperCtrl', function($scope, $http) {
    $http.get('https://spreadsheets.google.com/feeds/list/' + getParam("key") + '/1/public/values/' + getParam("id") + '?alt=json')
        .success(function(response) {
            $scope.tools = response.entry;
        });
});
app.controller("mainController", function($scope, $http, animalModel) {
    $scope.results = [];
    $scope.filterText = null;
    $scope.availableCategories = [];
    $scope.availableSpecies = [];
    $scope.categoryFilter = null;
    $scope.filterSpec = [];
    $scope.filters = {};
    $scope.key = getParam("key");
    $scope.setCategoryFilter = function(category) {
        $scope.categoryFilter = category;
    };
    $scope.results = animalModel.init();
    $scope.availableCategories = animalModel.getCategories();
    $scope.availableSpecies = animalModel.getSpecies();
});
app.factory('animalModel', function($http) {
    var classes = [];
    var availableCategories = [];
    var availableSpecies = [];
    var results = [];
    var init = function() {
        // Download the spreadsheet data and add it to the scope objects above
        $http.jsonp('https://spreadsheets.google.com/feeds/list/' + getParam("key") + '/oajwn3w/public/values?alt=json-in-script' + '&callback=JSON_CALLBACK').success(function(data) {

            angular.forEach(data, function(value, index) {
                angular.forEach(value.entry, function(classes, index) {
                    results.push(classes);
                    // Building data array
                    angular.forEach(classes.gsx$categoria, function(category, index) {
                        var exists = false;
                        angular.forEach(availableCategories, function(avCat, index) {
                            if (avCat == category) {
                                exists = true;
                            }
                        });
                        if (exists === false) {
                            availableCategories.push(category);
                        }
                    });
                    // Building status array
                    angular.forEach(classes.gsx$status, function(status, index) {
                        var exists = false;
                        angular.forEach(availableSpecies, function(avSpec, index) {
                            if (avSpec == status) {
                                exists = true;
                            }
                        });
                        if (exists === false) {
                            availableSpecies.push(status);
                        }
                    });
                });
            });
        }).error(function(error) {

        });
        return results;
    };
    var getSpecies = function() {
        return availableSpecies;
    };
    var getCategories = function() {
        return availableCategories;
    };

    return {
        init: init,
        getSpecies: getSpecies,
        getCategories: getCategories
    };
});