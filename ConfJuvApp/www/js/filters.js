angular.module('confjuvapp.filters', []).
  filter('htmlToPlainText', function() {
    return function(text) {
      return String(text).replace(/<[^>]+>/gm, '');
    };
  }
);
