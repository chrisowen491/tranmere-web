const Mustache = require('mustache');
import '../templates/builder.mustache';
const pack = require('../../../package.json');

function draw() {
  var base = '/builder/';
  var url =
    $('#kit').val() +
    '/' +
    $('#hair').val() +
    '/' +
    $('#skinColour').val() +
    '/' +
    $('#feature').val() +
    '/' +
    $('#colour').val() +
    '/' +
    $('#neckColour').val() +
    '/' +
    $('#background').val() +
    '/' +
    $('#highlights').val();

  $.get(
    '/assets/templates/builder.mustache?v=' + pack.version,
    function (template) {
      var article = Mustache.render(template, { img: url, base: base });
      $('#builder').html(article);
    }
  );
}
jQuery(function () {
  if ($('#builder').length) {
    draw();
    $('.btn-player-builder').on('click', function () {
      draw();
    });
  }
});
