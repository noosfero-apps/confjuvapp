angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope, $ionicModal, $http, $ionicPopup) {

    $scope.loading = false;

    /******************************************************************************
     L O G I N
     ******************************************************************************/

    $scope.loginFormDisplayed = false;

    $scope.displayLoginForm = function() {
      $scope.loginFormDisplayed = true;
      $scope.registerFormDisplayed = false;
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
          $scope.loadTopics(resp.data.private_token);
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

    // Register as a new user

    $scope.registerFormDisplayed = false;

    $scope.displayRegisterForm = function() {
      $scope.registerFormDisplayed = true;
      $scope.loginFormDisplayed = false;
    };

    // Function to register
    $scope.Register = function(data) {
      if (!data || !data.login || !data.email || !data.password || !data.password_confirmation) {
        $ionicPopup.alert({ title: 'Registrar', template: 'Por favor preencha todos os campos' });
        return;
      }
      else if (data.password != data.password_confirmation) {
        $ionicPopup.alert({ title: 'Registrar', template: 'Senhas não conferem' });
        return;
      }

      $scope.loading = true;

      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        timeout: 10000
      }
      
      $http.post(ConfJuvAppUtils.pathTo('register'), jQuery.param(data), config)  
      .then(function(resp) {
        var popup = $ionicPopup.alert({ title: 'Registrar', template: 'Usuário registrado com sucesso!' });
        popup.then(function() {
          $scope.registerFormDisplayed = false;
        });
        $scope.loading = false;
      }, function(err) {
        var msg = '';

        try {
          var errors = JSON.parse(err.data.message);
          for (var field in errors) {
            msg += 'Campo "' + field + '" ' + errors[field][0] + '. ';
          }
        } catch(e) {
          // Do nothing
        }
        $ionicPopup.alert({ title: 'Registrar', template: 'Erro ao registrar usuário. ' + msg });
        $scope.loading = false;
      });
    };

    $scope.backToLoginHome = function() {
      $scope.registerFormDisplayed = false;
      $scope.loginFormDisplayed = false;
    };

    /******************************************************************************
     D I S C U S S I O N S  >  T O P I C S  >  P R O P O S A L S
     ******************************************************************************/
    
    $scope.proposalList = [];
    $scope.topics = [];
    $scope.proposalsByTopic = {};

    // Load topics

    $scope.loadTopics = function(token) {
      $scope.loading = true;
      // var path = '?private_token=' + token + '&fields=title,image,body,abstract&content_type=ProposalsDiscussionPlugin::Proposal';
      var params = '?private_token=' + token + '&fields=title,id&content_type=ProposalsDiscussionPlugin::Topic';
      var path = 'articles/' + ConfJuvAppConfig.noosferoDiscussion + '/children' + params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.loading = false;
        var topics = resp.data.articles;
        for (var i = 0; i < topics.length; i++) {
          var topic = topics[i];
          $scope.topics.push(topic);
          $scope.proposalsByTopic[topic.id] = [];
          $scope.loadProposals(token, topic);
        }
      }, function(err) {
        $ionicPopup.alert({ title: 'Tópicos', template: 'Não foi possível carregar os tópicos' });
        $scope.loading = false;
      });
    };

    // Load proposals

    $scope.loadProposals = function(token, topic) {
      $scope.loading = true;
      var params = '?private_token=' + token + '&fields=title,image,body,abstract,id&content_type=ProposalsDiscussionPlugin::Proposal';
      var path = 'articles/' + topic.id + '/children' + params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        var proposals = resp.data.articles;
        for (var i = 0; i < proposals.length; i++) {
          var proposal = proposals[i];
          proposal.topic = topic;
          $scope.proposalList.push(proposal);
          $scope.proposalsByTopic[topic.id].push(proposal);
        }
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Propostas', template: 'Não foi possível carregar as propostas do tópico ' + topic.title });
        $scope.loading = false;
      });
    };

  }); // Ends controller
