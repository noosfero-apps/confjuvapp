// FIXME: Split it into smaller files

angular.module('confjuvapp.controllers', [])
  .controller('ProposalCtrl', function($scope, $ionicModal, $http, $ionicPopup, filterFilter, $cordovaSocialSharing, $ionicSideMenuDelegate) {

    $scope.largeScreen = (window.innerWidth >= 600);

    $scope.loading = false;

    $scope.init = function() {
      if (ConfJuvAppUtils.sawIntro() || document.location.search != '') {
        $scope.skipIntro();
      }
      else {
        $scope.showIntro();
      }
    };

    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
    };

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
      if (ConfJuvAppUtils.getPrivateToken()) {
        $scope.loadProfile();
      } else if ($scope.modal) {
        $scope.modal.show();
      } else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_login.html?3', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      }
    };

    $scope.loadStages = function() {
      $scope.stages = {
        one: ConfJuvAppUtils.dateDiff('23/07/2015', '30/09/2015'),
        two: ConfJuvAppUtils.dateDiff('01/10/2015', '31/10/2015'),
        three: ConfJuvAppUtils.dateDiff('01/11/2015', '20/12/2015')
      };
    };

    $scope.parseURLParams = function() {
      var params = document.location.search.replace(/^\?/, '').split('&');
      for (var i=0; i < params.length; i++) {
        var pair = params[i].split('=');

        if (pair[0] == 'proposal') {
          $scope.loadSingleProposal(pair[1]);
        }
      }
    };

    $scope.loadSingleProposal = function(pid) {
      $scope.loading = true;

      var params = '?private_token=' + $scope.token + '&fields=title,image,body,abstract,id,tag_list,categories,created_by&content_type=ProposalsDiscussionPlugin::Proposal';

      var path = 'articles/' + pid + params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.openProposal(resp.data.article);
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Proposta', template: 'Não foi possível carregar a proposta com id ' + pid });
        $scope.loading = false;
      });
    };

    // Function to logout
    $scope.logout = function() {
      ConfJuvAppUtils.setPrivateToken(null);
      $scope.profile = null;
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
        $scope.profile = resp.data.person;
        $scope.setStateAndCityOfProfile();
        popup.then(function() {
          $scope.loginCallback(resp.data.private_token);
        });
      }, function(err) {
        $scope.closeModal();
        var popup = $ionicPopup.alert({ title: 'Login', template: 'Erro ao efetuar login. Verifique usuário e senha e conexão com a internet.' });
        $scope.loggedIn = false;
        $scope.loading = false;
        $scope.data.password = '';
        popup.then(function() {
          $scope.openModal();
        });
      });
    };

    $scope.loginCallback = function(token) {
      $scope.topics = [];
      $scope.cards = [];
      $scope.topicFilter = { value: ConfJuvAppUtils.getTopicFilter() };
      $scope.emptyTopicsCount = $scope.topicFilter.value == 'all' ? 0 : 10;

      $scope.loggedIn = true;
      $scope.token = token;
      ConfJuvAppUtils.setPrivateToken(token);
      $scope.loadTopics(token);
      $scope.loadStages();
      $scope.parseURLParams();
      $scope.loadFollowedProposals();
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
      if (!$scope.profile.login && $scope.profile.email) $scope.profile.login = ConfJuvAppUtils.normalizeLogin($scope.profile.email);
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
        $ionicPopup.alert({ title: 'Campos de Registro', template: 'Não foi possível carregar os campos de registro.' });
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
    $scope.loadStates = function(selected) {
      $scope.loading = true;
      $scope.shouldDisplayCities = false;

      var path = 'states';

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.states = resp.data;
        if (selected) {
          $scope.loadCitiesByState(selected);
        }
        else if ($scope.profile && $scope.profile.state && !selected) {
          $scope.loadCitiesByState($scope.profile.state.id);
        }
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Estados', template: 'Não foi possível carregar os estados' });
        $scope.loading = false;
      });
    };

    //FIXME Refactor this code
    // Load State
    $scope.setStateAndCityOfProfile = function() {
      $scope.loading = true;

      var path = 'states/';
      if($scope.profile && $scope.profile.region){
        path += $scope.profile.region.parent_id;
      }else{
        return;
      }

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.profile.state = resp.data;
        if($scope.profile.state){
          $scope.setCityOfProfile();
        }
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Estados', template: 'Não foi possível atribuir o estado ao perfil' });
        $scope.loading = false;
      });
    };

    //FIXME Refactor this code
    // Load City
    $scope.setCityOfProfile = function() {
      $scope.loading = true;
      var path = 'states/';

      if($scope.profile && $scope.profile.region){
        path += $scope.profile.region.parent_id + '/cities/' + $scope.profile.region.id;
      }else{
        return;
      }

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.profile.city = resp.data;
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Cidade', template: 'Não foi possível atribuir a cidade ao perfil' });
        $scope.loading = false;
      });
    };

    // Load Cities
    $scope.loadCitiesByState = function(state_id) {
      $scope.loading = true;
      var path = 'states/' + state_id + '/cities';

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
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
    $scope.cards = [];
    $scope.topicFilter = { value: ConfJuvAppUtils.getTopicFilter() };
    $scope.emptyTopicsCount = $scope.topicFilter.value == 'all' ? 0 : 10;

    // FIXME Make the proposals filters more generic
    $scope.proposalsFilter = '';

    $scope.reloadTopics = function() {
      $scope.emptyTopicsCount = 0;

      if ($scope.topicFilter.value != 'all') {
        $scope.emptyTopicsCount = 10;
      }

      $scope.topics = [];
      $scope.loadTopics($scope.token);
    };

    $scope.reloadProposals = function() {
      ConfJuvAppUtils.setTopicFilter($scope.topicFilter.value);
      $scope.cards = [];
      $scope.reloadTopics();
    };

    // Load topics

    $scope.loadTopics = function(token) {
      $scope.loading = true;
      var params = '?private_token=' + token + '&fields=title,id&content_type=ProposalsDiscussionPlugin::Topic';
      var path = 'articles/' + ConfJuvAppConfig.noosferoDiscussion + '/children' + params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.loading = false;
        var topics = resp.data.articles;
        for (var i = 0; i < topics.length; i++) {
          var topic = topics[i];
          topic = topics[i];
          topic.lastProposalId = null;
          topic.empty = false;
          $scope.topics.push(topic);
          $scope.loadProposals(token, topic);
        }
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Eixos', template: 'Não foi possível carregar os eixos' });
        $scope.loading = false;
      });
    };

    // Load Proposals of My City
    $scope.loadProposalsOfMyCity = function() {
      $scope.loading = true;
      if($scope.proposalsFilter == ''){
        $scope.proposalsFilter = '&categories_ids=' + $scope.profile.region.id;
      }else{
        $scope.proposalsFilter = '';
      }
      $scope.reloadProposals();
      $scope.loading = false;
    }

    // Load proposals
    $scope.loadProposals = function(token, topic) {
      if ($scope.topicFilter.value != 'all' && topic.id != $scope.topicFilter.value) {
        return;
      }

      $scope.loading = true;

      var perPage = 1;
      if ($scope.topicFilter.value != 'all') {
        perPage = 11;
      }

      var params = '?t=' + (new Date().getTime()) + '&private_token=' + token + '&fields=title,image,body,abstract,id,tag_list,categories,created_by&content_type=ProposalsDiscussionPlugin::Proposal&per_page=' + perPage + '&oldest=younger_than&reference_id=' + topic.lastProposalId + $scope.proposalsFilter;

      var path = 'articles/' + topic.id + '/children' + params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        var proposals = resp.data.articles;

        for (var i = 0; i < proposals.length; i++) {
          if (i < perPage) {
            var proposal = proposals[i];
            proposal.topic = topic;
            $scope.cards.push(proposal);
          }
        }

        if (proposals.length == 0 && !topic.empty) {
          topic.empty = true;
          $scope.emptyTopicsCount++;
        }

        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Propostas', template: 'Não foi possível carregar as propostas do tópico ' + topic.title });
        $scope.loading = false;
      });
    };

    // Cards

    $scope.cardDestroyed = function(index) {
      var thisProposal = $scope.cards[index];
      var topic = thisProposal.topic;
      if (topic && (topic.lastProposalId == null || topic.lastProposalId > thisProposal.id)) {
        topic.lastProposalId = thisProposal.id;
      }
      $scope.cards.splice(index, 1);
      if ($scope.cards.length === 0) {

        // Browsing all proposals

        if (topic) {
          for (var i = 0; i < $scope.topics.length; i++) {
            var topic = $scope.topics[i];
            if (!topic.empty) {
              $scope.loadProposals($scope.token, topic);
            }
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

    /******************************************************************************
     S I N G L E  P R O P O S A L
     ******************************************************************************/

    $scope.proposal = null;

    // Function to open the modal
    $scope.openProposal = function(proposal) {
      $scope.proposal = proposal;

      if (!$scope.proposal.comments || $scope.proposal.comments.length == 0) {
        $scope.loadComments();
      }

      else {
        $scope.showProposal($scope.proposal);
      }
    };

    $scope.showProposal = function(proposal) {
      if ($scope.proposalModal) {
        $scope.proposalModal.show();
      }
      else {
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_proposal.html?18', {
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
        $ionicModal.fromTemplateUrl('html/_create_proposal.html?13', {
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
      else if (data.description.length > 2000) {
        $scope.closeProposalModal();
        var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'A descrição deve ter no máximo 2000 caracteres!' });
        popup.then(function() {
          $scope.openCreateProposalForm();
        });
      }
      else if (data.description.length < 140) {
        $scope.closeProposalModal();
        var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'A descrição deve ter no mínimo 140 caracteres! (a sua contém ' + data.description.length + ')'});
        popup.then(function() {
          $scope.openCreateProposalForm();
        });
      }
      else {
        $scope.loading = true;
        document.getElementById('save-proposal').innerHTML = 'Salvando...';

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
              categories: [data.city, data.state],
              author: { name: $scope.profile.name, id: $scope.profile.id }
            };
            $scope.cards.push(proposal);
            $scope.myProposals.push(proposal);
            $scope.loading = false;
            $scope.data.title = $scope.data.description = $scope.data.topic_id = null;
            document.getElementById('save-proposal').innerHTML = 'Criar';
          });
        }, function(err) {
          $scope.closeProposalModal();
          var popup = $ionicPopup.alert({ title: 'Criar proposta', template: 'Erro ao criar proposta!' });
          $scope.loading = false;
          document.getElementById('save-proposal').innerHTML = 'Criar';
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
        $ionicModal.fromTemplateUrl('html/_create_comment.html?7', {
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
          $scope.proposal.comments.unshift({ body: params.body, author: { name: $scope.profile.name }});
          $scope.commentStatus = '';
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

     $scope.loadComments = function() {
       $scope.commentStatus = '';
       $scope.loading = true;
       var config = {
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
         },
         timeout: 10000
       };

       if (!$scope.proposal.comments) $scope.proposal.comments = [];

       var last = $scope.proposal.lastCommentId || 0;
           path = 'articles/' + $scope.proposal.id + '/comments?oldest&reference_id=' + last + '&private_token=' + $scope.token + '&t=' + (new Date().getTime());

       $http.get(ConfJuvAppUtils.pathTo(path), config)
       .then(function(resp) {
         $scope.loading = false;
         var comments = resp.data.comments;
         $scope.proposal.comments = $scope.proposal.comments.concat(comments);
         if(comments.length > 0){
           $scope.proposal.lastCommentId = comments[comments.length - 1].id;
         }
         if ($scope.proposal.comments.length == 0) {
           $scope.commentStatus = 'none';
           $scope.proposal.comments = [{ body: '', skip: true, author: { name: '' }}];
         }
         $scope.showProposal($scope.proposal);
       }, function(err) {
         $scope.commentStatus = 'fail';
         var popup = $ionicPopup.alert({ title: 'Comentários', template: 'Erro ao carregar comentários da proposta ' + $scope.proposal.id });
         popup.then(function() {
           $scope.loading = false;
           $scope.showProposal($scope.proposal);
         });
       });
     };

    /******************************************************************************
     I N T R O D U C T I O N
     ******************************************************************************/

     $scope.showIntro = function() {
       $scope.introDisplayed = true;
       window.localStorage['saw_intro'] = true;
     }

     $scope.next = function() {
       $scope.$broadcast('slideBox.nextSlide');
     };

     $scope.skipIntro = function() {
       $scope.introDisplayed = false;
       $scope.openModal();    
     };

    /******************************************************************************
     S H A R I N G
     ******************************************************************************/

     $scope.share = function(proposal) {
       var message = 'Comente minha proposta na #3ConfJuv: ' + proposal.title,
           subject = 'Comente minha proposta na #3ConfJuv!',
           file    = null,
           link    = ConfJuvAppConfig.noosferoApiPublicHost + '/?proposal=' + proposal.id; 

       try {
         $cordovaSocialSharing.share(message, subject, file, link) // Share via native share sheet
         .then(
           function(result) {
             // Success!
           },
           function(err) {
             $ionicPopup.alert({ title: 'Compartilhar', template: 'Não foi possível compartilhar' });
           }
         );
       }
       catch (e) {
         $ionicPopup.alert({ title: 'Compartilhar', template: 'Esta funcionalidade está disponível apenas no celular' });
       }
     };

    /******************************************************************************
     E D I T  P R O P O S A L
     ******************************************************************************/
    //FIXME see a way to refactor this behavior with comment and report abuse

    // Function to open the modal
    $scope.openEditProposalForm = function() {
      $scope.closeProposal();

      $scope.data.city = $scope.proposal.categories[0];
      $scope.data.state = $scope.proposal.categories[1];
      $scope.data.title = $scope.proposal.title;
      $scope.data.description = $scope.proposal.body;
      $scope.data.topic_id = $scope.proposal.topic;

      if ($scope.editProposalModal) {
        $scope.editProposalModal.show();
        $scope.loadCitiesByState($scope.data.state.id);
      }
      else {
        $scope.loadStates($scope.data.state.id);
        // Initiate the modal
        $ionicModal.fromTemplateUrl('html/_edit_proposal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.editProposalModal = modal;
          $scope.editProposalModal.show();
        });
      }
    };

    // Function to close the modal
    $scope.closeEditProposalModal = function() {
      $scope.editProposalModal.hide();
      $scope.openProposal($scope.proposal);
      $scope.data.city = $scope.data.state = $scope.data.title = $scope.data.description = $scope.data.topic_id = null;
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.editProposalModal.remove();
      $scope.openProposal($scope.proposal);
    });

    // Submit the updated proposal
    $scope.updateProposal = function(data) {
      if (!data || !data.title || !data.description) {
        $scope.closeEditProposalModal();
        var popup = $ionicPopup.alert({ title: 'Alterar proposta', template: 'Por favor preencha todos os campos!' });
        popup.then(function() {
          $scope.openEditProposalForm();
        });
      }
      else if (data.description.length > 2000) {
        $scope.closeEditProposalModal();
        var popup = $ionicPopup.alert({ title: 'Alterar proposta', template: 'A descrição deve ter no máximo 2000 caracteres!' });
        popup.then(function() {
          $scope.openEditProposalForm();
        });
      }
      else if (data.description.length < 140) {
        $scope.closeEditProposalModal();
        var popup = $ionicPopup.alert({ title: 'Alterar proposta', template: 'A descrição deve ter no mínimo 140 caracteres! (a sua contém ' + data.description.length + ')'});
        popup.then(function() {
          $scope.openEditProposalForm();
        });
      }
      else {
        $scope.loading = true;
        document.getElementById('save-proposal').innerHTML = 'Salvando...';

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

        $http.post(ConfJuvAppUtils.pathTo('articles/' + $scope.proposal.id), jQuery.param(params), config)
        .then(function(resp) {
          var popup = $ionicPopup.alert({ title: 'Alterar proposta', template: 'Proposta alterada com sucesso!' });
          popup.then(function() {
            $scope.proposal.categories[0] = data.city;
            $scope.proposal.categories[1] = data.state;
            $scope.proposal.title = data.title;
            $scope.proposal.body = data.description;
            
            $scope.loading = false;
            document.getElementById('save-proposal').innerHTML = 'Salvar';
            $scope.closeEditProposalModal();
          });
        }, function(err) {
          $scope.closeEditProposalModal();
          var popup = $ionicPopup.alert({ title: 'Alterar proposta', template: 'Erro ao alterar proposta!' });
          $scope.loading = false;
          document.getElementById('save-proposal').innerHTML = 'Salvar';
          popup.then(function() {
            $scope.openEditProposalForm();
          });
        });
      }
    };

    /******************************************************************************
     F O L L O W  P R O P O S A L
     ******************************************************************************/

    $scope.showFollowedProposals = function() {
      $scope.cards = $scope.following.slice();
    }

    $scope.loadFollowedProposals = function() {
      $scope.loading = true;
      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        timeout: 10000
      };

      $http.get(ConfJuvAppUtils.pathTo('/articles/followed_by_me?fields=title,image,body,abstract,id,tag_list,categories,created_by&private_token=' + $scope.token + '&_=' + new Date().getTime()), config)
      .then(function(resp) {
        $scope.following = [];
        $scope.followingIds = [];
        var followed = resp.data.articles;
        for (var i = 0; i < followed.length; i++) {
          var p = followed[i];
          $scope.following.push(p);
          $scope.followingIds.push(p.id);
        }
        $scope.loading = false;
      }, function(err) {
        $scope.loading = false;
        $ionicPopup.alert({ title: 'Propostas seguidas', template: 'Erro ao carregar propostas seguidas' });
      });
    };

    $scope.isFollowing = function(proposal) {
      if ($scope.hasOwnProperty('followingIds')) {
        return ($scope.followingIds.indexOf(proposal.id) > -1);
      }
      else {
        return false;
      }
    };

    $scope.follow = function(proposal) {
      $scope.loading = true;

      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        timeout: 10000
      }

      $http.post(ConfJuvAppUtils.pathTo('articles/' + proposal.id + '/follow'), jQuery.param({ private_token: $scope.token }), config)
      .then(function(resp) {
        $ionicPopup.alert({ title: 'Seguir proposta', template: 'Pronto! Você pode acompanhar suas propostas seguidas através do menu lateral esquerdo.' });
        $scope.following.push(proposal);
        $scope.followingIds.push(proposal.id);
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Seguir proposta', template: 'Erro ao seguir proposta.' });
        $scope.loading = false;
      });
    };

    /******************************************************************************
     P R O F I L E
     ******************************************************************************/

    $scope.profile = null;

    // Load Profile
    $scope.loadProfile = function() {
      $scope.loading = true;

      var params = '?private_token=' + ConfJuvAppUtils.getPrivateToken() + '&t=' + (new Date().getTime()),
          path = 'people/me/' + params;

      $http.get(ConfJuvAppUtils.pathTo(path))
      .then(function(resp) {
        $scope.profile = resp.data.person;
        $scope.loginCallback(ConfJuvAppUtils.getPrivateToken());
        $scope.setStateAndCityOfProfile();
        $scope.loading = false;
      }, function(err) {
        $scope.token = ConfJuvAppUtils.setPrivateToken(null);
        $scope.loggedIn = false;
        var popup = $ionicPopup.alert({ title: 'Usuário', template: 'Sessão expirada. Por favor faça login novamente.' });
        popup.then(function() {
          $scope.openModal();
        });
        $scope.loading = false;
      });
    };

    $scope.showProfile = function() {
      if (!$scope.profile) {
        $scope.loadProfile();
      }
      $scope.displayProfile();
    };

    $scope.displayProfile = function() {
      if ($scope.profileModal) {
        $scope.profileModal.show();
      }
      else {
        $ionicModal.fromTemplateUrl('html/_profile.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.profileModal = modal;
          $scope.profileModal.show();
        });
      }
    };

    $scope.closeProfile = function() {
      $scope.profileModal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.profileModal.remove();
    });

    $scope.editProfile = function() {
      if ($scope.editProfileModal) {
        if ($scope.profile.state) {
          $scope.loadCitiesByState($scope.profile.state.id);
        }
        $scope.editProfileModal.show();
      }
      else {
        if (!$scope.profile) {
          $scope.loadProfile();
        }
        
        if ($scope.states.length == 0) {
          $scope.loadStates();
        }
        else if ($scope.profile.state) {
          $scope.loadCitiesByState($scope.profile.state.id);
        }

        if ($scope.signupPersonFields.length == 0) $scope.loadSignupPersonFields();
        $ionicModal.fromTemplateUrl('html/_edit_profile.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.editProfileModal = modal;
          $scope.editProfileModal.show();
        });
      }
    };

    $scope.closeEditProfile = function() {
      $scope.editProfileModal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.editProfileModal.remove();
    });

    $scope.updateProfile = function(profile) {
      $scope.loading = true;

      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        timeout: 10000
      };

      var params = {
        'private_token': $scope.token,
        'person[name]': profile.name,
        'person[orientacao_sexual]': profile.orientacao_sexual,
        'person[identidade_genero]': profile.identidade_genero,
        'person[transgenero]': profile.transgenero,
        'person[etnia]': profile.etnia
      };

      if(profile.city){
        params['person[region_id]'] = profile.city.id;
      }

      $http.post(ConfJuvAppUtils.pathTo('people/' + $scope.profile.id), jQuery.param(params), config)
      .then(function(resp) {
        $scope.profile = resp.data.person;
        $scope.setStateAndCityOfProfile();
        var popup = $ionicPopup.alert({ title: 'Perfil', template: 'Perfil atualizado com sucesso' });
        popup.then(function() {
          $scope.loading = false;
        });
        $scope.loading = false;
      }, function(err) {
        $ionicPopup.alert({ title: 'Perfil', template: 'Erro ao atualizar perfil' });
        $scope.loading = false;
      });
    };

    /******************************************************************************
     M Y  P R O P O S A L S
     ******************************************************************************/

    $scope.myProposals = [];

    $scope.showMyProposals = function() {
      if ($scope.myProposals.length == 0) {
        $scope.cards = [];

        var config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          timeout: 10000
        };

        var path = 'articles?private_token=' + $scope.token + '&fields=title,image,body,abstract,id,tag_list,categories,created_by&content_type=ProposalsDiscussionPlugin::Proposal&_=' + (new Date().getTime()) + '&author_id=' + $scope.profile.id + '&parent_id[]=';
          
        for (var i = 0; i < $scope.topics.length; i++) {
          path += '&parent_id[]=' +  $scope.topics[i].id;
        } 
        $scope.loading = true;
        
        $http.get(ConfJuvAppUtils.pathTo(path), config)
        .then(function(resp) {
          $scope.myProposals = resp.data.articles;
          $scope.cards = $scope.myProposals.slice();
          $scope.loading = false;
        }, function(err) {
          $scope.loading = false;
        });
      }
      else {
        $scope.cards = $scope.myProposals.slice();
      }
    };

  }); // Ends controller
