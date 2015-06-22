// Ionic ConfJuvApp

// angular.module is a global place for creating, registering and retrieving Angular modules
// the 2nd parameter is an array of 'requires'
angular.module('confjuvapp', ['ionic', 'confjuvapp.controllers', 'confjuvapp.filters', 'ionic.contrib.ui.tinderCards'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.directive('hideWhen', ['$window', function($window) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      function checkExpose() {
        var mq = $attr.hideWhen == 'large' ? '(min-width:768px)' : $attr.hideWhen;
        if ($window.matchMedia(mq).matches) {
          $element.addClass('ng-hide');
        }
        else {
          $element.removeClass('ng-hide');   
        }
      }
      function onResize() {
        debouncedCheck();
      }
      var debouncedCheck = ionic.debounce(function() {
        $scope.$apply(function() {
          checkExpose();
        });
      }, 300, false);
      checkExpose();
      ionic.on('resize', onResize, $window);
      $scope.$on('$destroy', function(){
        ionic.off('resize', onResize, $window);
      });
    }
  };
}])

.directive('noScroll', function() {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      $element.on('touchmove', function(e) {
        e.preventDefault();
      });
    }
  }
});
