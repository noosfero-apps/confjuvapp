var ConfJuvAppUtils = {
  pathTo: function(endpoint, noPrefix) {
    var prefix = '/api/' + ConfJuvAppConfig.noosferoApiVersion + '/';
    if (noPrefix) {
      prefix = '/';
    }
    return ConfJuvAppConfig.noosferoApiHost + prefix + endpoint;
  },

  normalizeLogin: function(login) {
    return login.replace(/@.*/g, '').toLowerCase().replace(' ', '-').replace(/[^a-z0-9-]/g, '');
  },

  setPrivateToken: function(value) {
    if(value == undefined || value == '' || value == null){
      window.localStorage.removeItem('private_token');
    }else{
      window.localStorage['private_token'] = value;
    }
  },

  getPrivateToken: function() {
    return window.localStorage['private_token'];
  }

};
