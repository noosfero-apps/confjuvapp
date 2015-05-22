var ConfJuvAppUtils = {
  pathTo: function(endpoint) {
    return ConfJuvAppConfig.noosferoApiHost + '/api/' + ConfJuvAppConfig.noosferoApiVersion + '/' + endpoint;
  }
};
