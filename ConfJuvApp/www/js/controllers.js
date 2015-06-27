// FIXME: Split it into smaller files

angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope, $ionicModal, $http, $ionicPopup, filterFilter) {

    $scope.largeScreen = (window.innerWidth >= 768);

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
          $scope.token = resp.data.private_token;
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
      $scope.loadStates();
      $scope.registerFormDisplayed = true;
      $scope.loginFormDisplayed = false;
      $scope.loading = false;
    };

    // Function to register
    $scope.Register = function(data) {
alert('no registro')
      if (!data || !data.login || !data.email || !data.password || !data.password_confirmation) {
alert('teste');
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
          msg = err.data.message;
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
     States > Cities
     ******************************************************************************/
    
    $scope.states = [];
    $scope.stateChoosed = null;
    $scope.cities = [];
    $scope.cityChoosed = null;
    $scope.shouldDisplayCities = false;

    // Load States
    $scope.loadStates = function() {
      $scope.loading = true;
      $scope.shouldDisplayCities = false;
      $scope.stateChoosed = null;
      $scope.cityChoosed = null;

      var path = 'states';

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.states = resp.data;
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Estados', template: 'Não foi possível carregar os estados' });
        $scope.loading = false;
      });
    };

    // Load Cities
    $scope.loadCitiesByState = function(state) {
      $scope.loading = true;

      var path = 'states/' + state + '/cities';

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.loading = false;
        $scope.cities = resp.data;
        $scope.shouldDisplayCities = true;
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Estados', template: 'Não foi possível carregar as cidades' });
        $scope.loading = false;
      });
    };

    /******************************************************************************
     D I S C U S S I O N S  >  T O P I C S  >  P R O P O S A L S
     ******************************************************************************/
    
    $scope.topics = [];
    $scope.proposalList = [];
    $scope.proposalsByTopic = {};
    $scope.cards = [];

    // Selected topics

    $scope.selection = [];

    // Helper method to get selected topics

    $scope.selectedTopics = function selectedTopics() {
      return filterFilter($scope.topics, { selected: true });
    };

    // Watch topics for changes

    $scope.$watch('topics|filter:{selected:true}', function (nv) {
      $scope.selection = nv.map(function (topic) {
        return topic.title;
      });
    }, true);

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
          topic.selected = true;
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
          $scope.cards.push(proposal);
        }
        fillBackgroundWithColor('#FAFAFA');
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Propostas', template: 'Não foi possível carregar as propostas do tópico ' + topic.title });
        $scope.loading = false;
      });
    };

    // Cards

    $scope.cardDestroyed = function(index) {
      $scope.cards.splice(index, 1);
      if ($scope.cards.length === 0) {
        for (var i = 0; i < $scope.proposalList.length; i++) {
          var card = $scope.proposalList[i];
          if (card.topic.selected) {
            $scope.cards.push(card);
          }
        }
      }
    };

    $scope.nextCard = function() {
      var index = $scope.cards.length - 1;
      if (index == -1) {
        index = 0;
      }
      $scope.cardDestroyed(index);
    };

    // Swipe cards when filters are selected
    $scope.$watch('selection', function() {
      $scope.cards = [];
      for (var i = 0; i < $scope.proposalList.length; i++) {
        var card = $scope.proposalList[i];
        if (card.topic.selected) {
          $scope.cards.push(card);
        }
      }
    });

    /******************************************************************************
     S I N G L E  P R O P O S A L
     ******************************************************************************/

    $scope.proposal = null;

    // Function to open the modal
    $scope.openProposal = function(proposal) {
      $scope.proposal = proposal;

      if (!$scope.proposal.comments || $scope.proposal.comments.length == 0) {
        loadComments();
      }

      if ($scope.proposalModal) {
        $scope.proposalModal.show();
      }
      else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_proposal.html?1', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.proposalModal = modal;
          $scope.proposalModal.show();
        });
      }
    };

    // Function to close the modal
    $scope.closeProposal = function() {
      $scope.proposalModal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.proposalModal.remove();
    });

    /******************************************************************************
     C R E A T E  P R O P O S A L
     ******************************************************************************/

    // Function to open the modal
    $scope.openCreateProposalForm = function() {
      if ($scope.createProposalModal) {
        $scope.createProposalModal.show();
      }
      else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_create_proposal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.createProposalModal = modal;
          $scope.createProposalModal.show();
        });
      }
    };

    // Function to close the modal
    $scope.closeProposalModal = function() {
      $scope.createProposalModal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.createProposalModal.remove();
    });

    // Submit the proposal
    $scope.createProposal = function(data) {
      if (!data || !data.title || !data.description || !data.topic_id) {
        $scope.closeProposalModal();
        var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'Por favor preencha todos os campos!' });
        popup.then(function() {
          $scope.openCreateProposalForm();
        });
      }
      else if (data.description.length > 1000) {
        $scope.closeProposalModal();
        var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'A descrição deve ter no máximo 1000 caracteres!' });
        popup.then(function() {
          $scope.openCreateProposalForm();
        });
      }
      else {
        $scope.loading = true;

        var config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          timeout: 10000
        };

        var params = {
          'private_token': $scope.token,
          'article[body]': data.description,
          'article[name]': data.title,
          'article[abstract]': data.description.substring(0, 130) + '...',
          'fields': 'id',
          'article[type]': 'ProposalsDiscussionPlugin::Proposal',
          'content_type': 'ProposalsDiscussionPlugin::Proposal'
        };
        
        $http.post(ConfJuvAppUtils.pathTo('articles/' + data.topic_id + '/children'), jQuery.param(params), config)  
        .then(function(resp) {
          $scope.closeProposalModal();
          var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'Proposta criada com sucesso!' });
          popup.then(function() {
            var topic = null;
            for (var i = 0; i < $scope.topics.length; i++) {
              if (data.topic_id == $scope.topics[i].id) {
                topic = $scope.topics[i];
              }
            }
            var proposal = {
              title: data.title,
              body: data.description,
              topic: topic
            };
            $scope.proposalList.push(proposal);
            $scope.cards.push(proposal);
            $scope.proposalsByTopic[data.topic_id].push(proposal);
            data.title = data.description = data.topic_id = null;
            $scope.loading = false;
          });
        }, function(err) {
          $scope.closeProposalModal();
          var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'Erro ao criar proposta!' });
          $scope.loading = false;
          popup.then(function() {
            $scope.openCreateProposalForm();
          });
        });
      }
    };

    /******************************************************************************
     C R E A T E  C O M M E N T
     ******************************************************************************/

    // Function to open the modal
    $scope.openCommentForm = function() {
      $scope.closeProposal();
      if ($scope.commentModal) {
        $scope.commentModal.show();
      }
      else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_create_comment.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.commentModal = modal;
          $scope.commentModal.show();
        });
      }
    };

    // Function to close the modal
    $scope.closeCommentModal = function() {
      $scope.commentModal.hide();
      $scope.openProposal($scope.proposal);
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.commentModal.remove();
      $scope.openProposal($scope.proposal);
    });

    // Submit the comment
    $scope.createComment = function(data) {
      if (!data || !data.comment) {
        $scope.closeCommentModal();
        var popup = $ionicPopup.alert({ title: 'Comentar', template: 'O seu comentário não pode ficar em branco!' });
        popup.then(function() {
          $scope.openCommentForm();
        });
      }
      else if (data.comment.length > 1000) {
        $scope.closeCommentModal();
        var popup = $ionicPopup.alert({ title: 'Comentar', template: 'O comentário deve ter no máximo 1000 caracteres!' });
        popup.then(function() {
          $scope.openCommentForm();
        });
      }
      else {
        $scope.loading = true;

        var config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          timeout: 10000
        };

        var params = {
          'private_token': $scope.token,
          'body': data.comment
        };
        
        $http.post(ConfJuvAppUtils.pathTo('articles/' + $scope.proposal.id + '/comments'), jQuery.param(params), config)  
        .then(function(resp) {
          $scope.closeCommentModal();
          var popup = $ionicPopup.alert({ title: 'Comentar', template: 'Comentário criado com sucesso!' });
          if (!$scope.proposal.comments) {
            $scope.proposal.comments = [];
          }
          $scope.proposal.comments.unshift({ body: params.body, author: { name: $scope.user.name }});
          popup.then(function() {
            $scope.loading = false;
          });
        }, function(err) {
          $scope.closeCommentModal();
          var popup = $ionicPopup.alert({ title: 'Comentar', template: 'Erro ao criar comentário!' });
          popup.then(function() {
            $scope.loading = false;
            $scope.openCommentForm();
          });
        });
      }
    };

    /******************************************************************************
     L O A D  C O M M E N T S
     ******************************************************************************/

     var loadComments = function() {
       $scope.loading = true;
       var config = {
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
         },
         timeout: 10000
       };

       $http.get(ConfJuvAppUtils.pathTo('articles/' + $scope.proposal.id + '/comments?private_token=' + $scope.token), config)
       .then(function(resp) {
         $scope.loading = false;
         $scope.proposal.comments = resp.data.comments;
         if ($scope.proposal.comments.length == 0) {
           $scope.proposal.comments = [{ body: '', skip: true, author: { name: '' }}];
         }
       }, function(err) {
         var popup = $ionicPopup.alert({ title: 'Comentários', template: 'Erro ao carregar comentários da proposta ' + $scope.proposal.id });
         popup.then(function() {
           $scope.loading = false;
         });
       });
     };

  }); // Ends controller
