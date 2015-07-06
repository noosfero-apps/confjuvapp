angular.module('confjuvapp.filters', []).
  filter('htmlToPlainText', function() {
    return function(text) {
      return String(text).replace(/<[^>]+>/gm, '');
    };
  }
).filter('categoryType', function() {
    return function(categories, type) {
      for (var i = 0; i < categories.length; i++) {
        if(categories[i].type.toLowerCase() == type){
          return categories[i].name;
        }
      }
    };
  }
);
