// Ionic ConfJuvApp

// angular.module is a global place for creating, registering and retrieving Angular modules
// the 2nd parameter is an array of 'requires'
angular.module('confjuvapp', ['ionic', 'confjuvapp.controllers', 'confjuvapp.filters'])

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
