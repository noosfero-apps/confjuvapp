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
  }
};
