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
  },

  shareOnTwitter: function() {
    var title = document.getElementById('proposal-title').innerHTML,
        id    = document.getElementById('proposal-id').innerHTML,
        text  = 'Apoie a minha proposta para a #3ConfJuv: ' + title + ' ' + ConfJuvAppConfig.noosferoApiPublicHost + '/?proposal=' + id,
        url   = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
    return url;
  },

  shareOnFacebook: function() {
    var title = document.getElementById('proposal-title').innerHTML,
        id    = document.getElementById('proposal-id').innerHTML,
        link  = ConfJuvAppConfig.noosferoApiPublicHost + '/?proposal=' + id,
        url   = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link);
    return url;
  },

  dateDiff: function(start, end) {
    var oneday = 24 * 60 * 60 * 1000, // hours * minutes * seconds * milliseconds
        today = new Date(),
        msg = '',
        s = start.split('/'),
        e = end.split('/');

    start = new Date(s[2], parseInt(s[1]) - 1, s[0]);
    end = new Date(e[2], parseInt(e[1]) - 1, e[0]);

    if (today > start && today < end) {
      start = today;
      var days = Math.round(Math.abs((start.getTime() - end.getTime())/(oneday)));
      msg = '+ ' + days + ' dia';
      if (days > 1) {
        msg += 's';
      }
    }

    else {
      msg = s[0] + '/' + s[1] + ' a ' + e[0] + '/' + e[1];
    }

    return msg;
  }
};
