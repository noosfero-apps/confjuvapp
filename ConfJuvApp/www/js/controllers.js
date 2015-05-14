angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope, $ionicModal) {

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
    $ionicModal.fromTemplateUrl('modal.html', {
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
      $scope.closeModal();
    };

  }); // Ends controller
