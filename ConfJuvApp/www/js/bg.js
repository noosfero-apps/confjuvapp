var pattern = Trianglify({
  width: window.innerWidth, 
  height: window.innerHeight,
  x_colors: 'Spectral',
  y_colors: 'match_x',
  cell_size: 90,
  variance: 0.5
});

var fillBackgroundWithTriangles = function() {
  document.body.style.background = "url(" + pattern.png() + ") no-repeat fixed";
  document.getElementById('body').style.background = "url(" + pattern.png() + ") no-repeat fixed";
};

var fillBackgroundWithColor = function(color) {
  document.body.style.background = document.getElementById('body').style.background = document.getElementById('proposals-container').style.background = color;
};

fillBackgroundWithTriangles();
