angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope) {
    // FIXME: This list should come from the server
    $scope.proposalList = [
      {
        title: 'Diminuir os juros do FIES'
      },
      {
        title: 'Desmilitarizar a polícia'
      }
    ];
  });
