angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope, $ionicModal, $http, $ionicPopup) {

    // FIXME: This list should come from the server
    $scope.proposalList = [
      {
        title: 'Diminuir os juros do FIES'
      },
      {
        title: 'Desmilitarizar a polícia'
      }
    ];

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

      var req = {
        method: 'POST',
        url: ConfJuvAppUtils.pathTo('login'),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        data: jQuery.param(data)
      }
      
      $http(req)
      .success(function(data, status, headers, config) {
        $scope.closeModal();
        $ionicPopup.alert({ title: 'Login', template: 'Login efetuado com sucesso!' });
        ConfJuvAppUtils.loggedIn = true;
      })
      .error(function(data, status, headers, config) {
        $scope.closeModal();
        var popup = $ionicPopup.alert({ title: 'Login', template: 'Erro ao efetuar login, por favor tente novamente.' });
        ConfJuvAppUtils.loggedIn = false;
        popup.then(function() {
          $scope.openModal();
        });
      });
    };

  }); // Ends controller
