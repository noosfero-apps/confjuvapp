angular.module('confjuvapp.filters', []).
filter('htmlToPlainText', function() {
  return function(text) {
    return String(text).replace(/<[^>]+>/gm, '');
  };
}).
filter('categoryType', function() {
  return function(categories, type) {
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].type.toLowerCase() == type) {
        return categories[i].name;
      }
    }
  };
}).
filter('tagFilter', function() {
  return function(text) {
    return String(text).replace(/#/gm, '');
  };
}).
filter('etniaFilter', function() {
  return function(type) {
    var etnia = {};
    etnia[1] = 'Pardo';
    etnia[2] = 'Preto';
    etnia[3] = 'Branco';
    etnia[4] = 'Indígena';
    etnia[5] = 'Amarelo';
    return etnia[type];
  };
}).
filter('orientacaoSexualFilter', function() {
  return function(type) {
    var orientacao = {};
    orientacao[1] = 'Homosexual';
    orientacao[2] = 'Heterosexual';
    orientacao[3] = 'Bisexual';
    orientacao[4] = 'Assexual';
    return orientacao[type];
  };
}).
filter('generoFilter', function() {
  return function(type) {
    var genero = {};
    genero[1] = 'Masculino';
    genero[2] = 'Feminino';
    return genero[type];
  };
});
