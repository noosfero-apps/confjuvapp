var ConfJuvAppUtils = {
  pathTo: function(endpoint, noPrefix) {
    var prefix = '/api/' + ConfJuvAppConfig.noosferoApiVersion + '/';
    if (noPrefix) {
      prefix = '/';
    }
    return ConfJuvAppConfig.noosferoApiHost + prefix + endpoint;
  }
};
