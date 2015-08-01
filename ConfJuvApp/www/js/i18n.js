var ConfJuvAppI18n = {
  t: function(text) {
    return this.strings[text] ? this.strings[text] : text;
  },

  strings: {
    'has already been taken': 'já existe'
  }
};
