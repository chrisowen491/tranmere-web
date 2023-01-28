// Files Referenced
import '../scss/style.scss';
import '../logos/logo_v1.png';
import '../logos/logo_v2_hex_d9dde3.png';
import '../logos/logo_white_transparent.png';
import '../logos/logo_white_transparent.png';
import '../logos/square_v1.png';

require('bootstrap');

// accordion
jQuery(function () {
  $('.collapse').on('show.bs.collapse', function () {
      $(this).parent().addClass('active');
  });

  $('.collapse').on('hide.bs.collapse', function () {
      $(this).parent().removeClass('active');
  });

  //$('[data-toggle="tooltip"]').tooltip()

  var window_width = jQuery( window ).width();

  // recalc on collapse
  $('.nav-item .collapse').on('shown.bs.collapse hidden.bs.collapse', function () {
    $(".sticky").trigger("sticky_kit:recalc");
  });
});

(function(){
  if (typeof self === 'undefined' || !self.Prism || !self.document) {
    return;
  }
  var callbacks = [];
})();
