angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope, $ionicModal, $http, $ionicPopup) {

    $scope.loading = false;

    /******************************************************************************
     L O G I N
     ******************************************************************************/

     $scope.loginFormDisplayed = false;

     $scope.displayLoginForm = function() {
       $scope.loginFormDisplayed = true;
     };

    // Function to open the modal
    $scope.openModal = function() {
      if ($scope.modal) {
        $scope.modal.show();
      }
      else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_login.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      }
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
        $scope.loggedIn = true;
        $scope.user = resp.data.person;
        popup.then(function() {
          $scope.loadDiscussions(resp.data.private_token);
        });
      }, function(err) {
        $scope.closeModal();
        var popup = $ionicPopup.alert({ title: 'Login', template: 'Erro ao efetuar login. Verifique usuário e senha e conexão com a internet.' });
        $scope.loggedIn = false;
        $scope.loading = false;
        popup.then(function() {
          $scope.openModal();
        });
      });
    };

    // Function to retrieve password
    $scope.forgotPassword = function(email) {
      if (!email) {
        var popup = $ionicPopup.alert({ title: 'Esqueceu a senha?', template: 'Digite seu e-mail no campo "Usuário" e clique novamente neste link' });
        return;
      }

      $scope.loading = true;

      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        timeout: 10000
      }

      var data = { value: email };
      
      $http.post(ConfJuvAppUtils.pathTo('account/forgot_password', true), jQuery.param(data), config)
      .then(function(resp) {
        $ionicPopup.alert({ title: 'Esqueceu a senha?', template: 'Um link para redefinição de senha foi enviado para o seu e-mail.' });
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Esqueceu a senha?', template: 'Erro ao requisitar redefinição de senha.' });
        $scope.loading = false;
      });
    };


    /******************************************************************************
     D I S C U S S I O N S
     ******************************************************************************/
    
    $scope.discussionsList = [];

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
