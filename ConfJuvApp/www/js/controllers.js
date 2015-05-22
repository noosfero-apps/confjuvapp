angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope, $ionicModal, $http, $ionicPopup) {

    $scope.loading = false;

    // FIXME: This list should come from the server
    $scope.discussionsList = [];

    // Login modal

    // Initiate the modal
    $ionicModal.fromTemplateUrl('html/_login.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Function to open the modal
    $scope.openModal = function() {
      $scope.modal.show();
    };

    // Function to close the modal
    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    // Function to login
    $scope.Login = function(data) {
      if (!data || !data.login || !data.password) {
        return;
      }

      $scope.loading = true;

      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        timeout: 10000
      }
      
      $http.post(ConfJuvAppUtils.pathTo('login'), jQuery.param(data), config)  
      .then(function(resp) {
        $scope.closeModal();
        var popup = $ionicPopup.alert({ title: 'Login', template: 'Login efetuado com sucesso!' });
        ConfJuvAppUtils.loggedIn = true;
        popup.then(function() {
          $scope.loadDiscussions(resp.data.private_token);
        });
      }, function(err) {
        $scope.closeModal();
        var popup = $ionicPopup.alert({ title: 'Login', template: 'Erro ao efetuar login. Verifique usuário e senha e conexão com a internet.' });
        ConfJuvAppUtils.loggedIn = false;
        $scope.loading = false;
        popup.then(function() {
          $scope.openModal();
        });
      });
    };

    $scope.loadDiscussions = function(token) {
      $scope.discussionsList = [];

      var path = '?private_token=' + token + '&fields=title&content_type=ProposalsDiscussionPlugin::Discussion';
      
      if (ConfJuvAppConfig.noosferoCommunity == '') {
        path = 'articles' + path;
      }
      else {
        path = 'communities/' + ConfJuvAppConfig.noosferoCommunity + '/articles' + path;
      }

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.loading = false;
        $scope.discussionsList = resp.data.articles;
      }, function(err) {
        var popup = $ionicPopup.alert({ title: 'Discussões', template: 'Não foi possível carregar as discussões' });
        $scope.loading = false;
      });
    };

  }); // Ends controller
