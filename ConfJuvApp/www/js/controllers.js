// FIXME: Split it into smaller files

angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope, $ionicModal, $http, $ionicPopup, filterFilter) {

    $scope.largeScreen = (window.innerWidth >= 600);

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
      if(ConfJuvAppUtils.getPrivateToken()){
        $scope.token = ConfJuvAppUtils.getPrivateToken();
        $scope.loggedIn = true;
        $scope.loadMe();
        $scope.loadTopics($scope.token);
      } else if ($scope.modal) {
        $scope.modal.show();
      } else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_login.html?2', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      }
    };

    // Function to logout
    $scope.logout = function() {
      ConfJuvAppUtils.setPrivateToken(null);
      $scope.openModal();
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
          ConfJuvAppUtils.setPrivateToken($scope.token);
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
    $scope.registerFormType = '';

    $scope.displayRegisterForm = function(value) {
      $scope.loadStates();
      $scope.loadSignupPersonFields();
      $scope.registerFormDisplayed = true;
      $scope.registerFormType = value;
      $scope.loginFormDisplayed = false;
      $scope.loading = false;
    };

    $scope.data = {};

    $scope.setLoginBasedOnEmail = function() {
      if (!$scope.data.login && $scope.data.email) $scope.data.login = ConfJuvAppUtils.normalizeLogin($scope.data.email);
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


      var params = {
        'email': data.email,
        'login': data.login,
        'password': data.password,
        'password_confirmation': data.password_confirmation,
        'tipo': $scope.registerFormType,
        'orientacao_sexual': data.orientacao_sexual,
        'identidade_genero': data.identidade_genero,
        'transgenero': data.transgenero,
        'etnia': data.etnia,
        'city': data.city.id
      };

      $http.post(ConfJuvAppUtils.pathTo('register'), jQuery.param(params), config)
      .then(function(resp) {
        var popup = $ionicPopup.alert({ title: 'Registrar', template: 'Registro feito! Agora é só fazer login!' });
        popup.then(function() {
          $scope.registerFormDisplayed = false;
        });
        $scope.loading = false;
      }, function(err) {
        var msg = '';

        try {
          var errors = JSON.parse(err.data.message);
          for (var field in errors) {
            msg += 'Campo "' + field + '" ' + ConfJuvAppI18n.t(errors[field][0]) + '. ';
          }
        } catch(e) {
          msg = err.data.message;
        }
        $ionicPopup.alert({ title: 'Registrar', template: 'Erro ao registrar usuário. ' + msg });
        $scope.loading = false;
      });
    };

    // Load Signup Person Fields
    $scope.signupPersonFields = []
    $scope.loadSignupPersonFields = function() {
      $scope.loading = true;

      var path = 'environment/signup_person_fields';

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.signupPersonFields = resp.data;
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Campos Customizados de Registro', template: 'Não foi possível carregar os campos customizados de cadastro' });
        $scope.loading = false;
      });
    };

    // Load Me
    $scope.loadMe = function() {
      $scope.loading = true;

      var params = '?private_token=' + ConfJuvAppUtils.getPrivateToken();
      var path = 'people/me/' +params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.user = resp.data.person;
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Usuário', template: 'Não foi possível carregar o usuário' });
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
    $scope.cities = [];
    $scope.shouldDisplayCities = false;

    // Load States
    $scope.loadStates = function() {
      $scope.loading = true;
      $scope.shouldDisplayCities = false;

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
    $scope.loadCitiesByState = function(state_id) {
      $scope.loading = true;

      var path = 'states/' + state_id + '/cities';

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
    $scope.forceReload = false;

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
      $scope.forceReload = false;
      $scope.loading = true;
      // var path = '?private_token=' + token + '&fields=title,image,body,abstract&content_type=ProposalsDiscussionPlugin::Proposal';
      var params = '?private_token=' + token + '&fields=title,id&content_type=ProposalsDiscussionPlugin::Topic';
      var path = 'articles/' + ConfJuvAppConfig.noosferoDiscussion + '/children' + params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.loading = false;
        var topics = resp.data.articles;
        for (var i = 0; i < topics.length; i++) {
          var topic_id = topics[i].id;
          var topic = null;
          for (var j = 0; j < $scope.topics.length; j++) {
            if (topic_id == $scope.topics[j].id) {
              topic = $scope.topics[j];
            }
          }
          if (topic == null) {
            topic = topics[i];
            topic.selected = true;
            $scope.topics.push(topic);
          }
          $scope.proposalsByTopic[topic.id] = [];
          $scope.loadProposals(token, topic);
        }
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Eixos', template: 'Não foi possível carregar os eixos' });
        $scope.loading = false;
      });
    };

    // Load proposals

    $scope.loadProposals = function(token, topic) {
      $scope.loading = true;
      last_proposal = $scope.proposalsByTopic[topic.id][$scope.proposalsByTopic[topic.id].length -1];
      last_proposal = last_proposal == undefined ? null : last_proposal.id;

      var params = '?private_token=' + token + '&fields=title,image,body,abstract,id,tag_list,categories,created_by&content_type=ProposalsDiscussionPlugin::Proposal&limit=' + ConfJuvAppConfig.proposalsPerPageAndTopic + '&oldest=younger_than&reference_id=' + last_proposal;

      var path = 'articles/' + topic.id + '/children' + params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        var proposals = resp.data.articles;
        $scope.proposalsByTopic[topic.id] = [];
        for (var i = 0; i < proposals.length; i++) {
          var proposal = proposals[i];
          proposal.topic = topic;
          $scope.proposalList.push(proposal);
          $scope.proposalsByTopic[topic.id].push(proposal);
          $scope.cards.push(proposal);
        }
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
        for (var i = 0; i < $scope.topics.length; i++) {
          var topic = $scope.topics[i];
          topic.selected = true;
          $scope.proposalList= [];
          $scope.loadProposals($scope.token, topic);
        }
        if ($scope.proposalList.length == 0){
          $scope.forceReload = true;
        }
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
        $ionicModal.fromTemplateUrl('html/_proposal.html?4', {
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
        $scope.loadStates();
        $ionicModal.fromTemplateUrl('html/_create_proposal.html?11', {
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
          'article[free_conference]': data.free_conference,
          'article[body]': data.description,
          'article[name]': data.title,
          'article[category_ids]': [data.state.id, data.city.id],
          'article[abstract]': data.description.substring(0, 130) + '...',
          'fields': 'id',
          'content_type': 'ProposalsDiscussionPlugin::Proposal'
        };

        $http.post(ConfJuvAppUtils.pathTo('articles/' + data.topic_id.id + '/children'), jQuery.param(params), config)
        .then(function(resp) {
          $scope.closeProposalModal();
          var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'Proposta criada com sucesso!' });
          popup.then(function() {
            var topic = null;
            for (var i = 0; i < $scope.topics.length; i++) {
              if (data.topic_id.id == $scope.topics[i].id) {
                topic = $scope.topics[i];
              }
            }
            var proposal = {
              id: resp.data.article.id,
              title: data.title,
              body: data.description,
              topic: topic,
              author: { name: $scope.user.name, id: $scope.user.id }
            };
            $scope.proposalList.push(proposal);
            $scope.cards.push(proposal);
            $scope.proposalsByTopic[data.topic_id.id].push(proposal);
            $scope.loading = false;
            $scope.data.title = $scope.data.description = $scope.data.topic_id = null;
            document.getElementById('save-proposal').innerHTML = 'Salvar';
          });
        }, function(err) {
          $scope.closeProposalModal();
          var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'Erro ao criar proposta!' });
          $scope.loading = false;
          document.getElementById('save-proposal').innerHTML = 'Salvar';
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
        $ionicModal.fromTemplateUrl('html/_create_comment.html?5', {
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
      document.getElementById('createcomment').disabled = false;
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
          $scope.data.comment = '';
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
     R E P O R T  A B U S E
     ******************************************************************************/
    //FIXME see a way to refactor this behavior with comment
    // Function to open the modal
    $scope.openReportAbuseForm = function() {
      $scope.closeProposal();
      if ($scope.reportAbuseModal) {
        $scope.reportAbuseModal.show();
      }
      else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_create_report_abuse.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.reportAbuseModal = modal;
          $scope.reportAbuseModal.show();
        });
      }
    };

    // Function to close the modal
    $scope.closeReportAbuseModal = function() {
      $scope.reportAbuseModal.hide();
      $scope.openProposal($scope.proposal);
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.reportAbuseModal.remove();
      $scope.openProposal($scope.proposal);
    });

    // Submit the report abuse
    $scope.createReportAbuse = function(data) {
      if (!data || !data.report_abuse) {
        $scope.closeReportAbuseModal();
        var popup = $ionicPopup.alert({ title: 'Denunciar', template: 'A sua denúncia não pode ficar em branco!' });
        popup.then(function() {
          $scope.openReportAbuseForm();
        });
      }
      else if (data.report_abuse.length > 1000) {
        $scope.closeReportAbuseModal();
        var popup = $ionicPopup.alert({ title: 'Denunciar', template: 'A denúncia deve ter no máximo 1000 caracteres!' });
        popup.then(function() {
          $scope.openReportAbuseForm();
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
          'report_abuse': data.report_abuse
        };

        $http.post(ConfJuvAppUtils.pathTo('articles/' + $scope.proposal.id + '/report_abuse'), jQuery.param(params), config)
        .then(function(resp) {
          $scope.closeReportAbuseModal();
          var popup = $ionicPopup.alert({ title: 'Denunciar', template: 'Denúncia criada com sucesso!' });
          popup.then(function() {
            $scope.loading = false;
          });
        }, function(err) {
          $scope.closeReportAbuseModal();
          var popup = $ionicPopup.alert({ title: 'Denunciar', template: 'Erro ao criar denúncia!' });
          popup.then(function() {
            $scope.loading = false;
            $scope.openReportAbuseForm();
          });
        });
      }
    };

    /******************************************************************************
     C R E A T E  T A G
     ******************************************************************************/
    //FIXME see a way to refactor this behavior with comment and report abuse

    // Function to open the modal
    $scope.openTagForm = function() {
      $scope.closeProposal();
      if ($scope.tagModal) {
        $scope.tagModal.show();
      }
      else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_create_tag.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.tagModal = modal;
          $scope.tagModal.show();
        });
      }
    };

    // Function to close the modal
    $scope.closeTagModal = function() {
      $scope.tagModal.hide();
      $scope.openProposal($scope.proposal);
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.tagModal.remove();
      $scope.openProposal($scope.proposal);
    });

    // Submit the tag
    $scope.createTag = function(data) {
      if (!data || !data.tag) {
        $scope.closeTagModal();
        var popup = $ionicPopup.alert({ title: 'Tag', template: 'Sua lista de tags não pode ficar em branco!' });
        popup.then(function() {
          $scope.openTagForm();
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
          'tags': data.tag
        };

        $http.post(ConfJuvAppUtils.pathTo('articles/' + $scope.proposal.id + '/tags'), jQuery.param(params), config)
        .then(function(resp) {
          $scope.closeTagModal();
          var popup = $ionicPopup.alert({ title: 'Tags', template: 'Tags adicionadas com sucesso!' });
          $scope.proposal.tag_list = data.tag.split(',');
          $scope.data.tag = '';
          popup.then(function() {
            $scope.loading = false;
          });
        }, function(err) {
          $scope.closeTagModal();
          var popup = $ionicPopup.alert({ title: 'Tags', template: 'Erro ao adicionar tags!' });
          popup.then(function() {
            $scope.loading = false;
            $scope.openTagForm();
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
