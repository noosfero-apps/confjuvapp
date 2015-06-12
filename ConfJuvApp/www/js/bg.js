var pattern = Trianglify({
  width: window.innerWidth, 
  height: window.innerHeight,
  x_colors: 'Spectral',
  y_colors: 'match_x',
  cell_size: 90,
  variance: 0.5
});

document.body.style.background = "url(" + pattern.png() + ") no-repeat fixed";
document.getElementById('body').style.background = "url(" + pattern.png() + ") no-repeat fixed";
