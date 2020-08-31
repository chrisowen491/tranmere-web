(function ($) {
  "use strict";

  var fn = {

    // Launch Functions
    Launch: function () {
      fn.Header();
      fn.Masonry();
      fn.Overlay();
      fn.Filetree();
      fn.OwlCarousel();
      fn.ImageView();
      fn.Apps();
    },


    Header: function (){
      $(document.body).headroom({
        tolerance : 10
      });
    },


    Masonry: function() {
      var $grid = $('.masonry').masonry({
        itemSelector: '.masonry > *',
      });
    },


    // Owl Carousel
    OwlCarousel: function() {

      $('.owl-carousel').each(function() {
        var a = $(this),
          items = a.data('items') || [1,1,1,1],
          margin = a.data('margin'),
          loop = a.data('loop'),
          nav = a.data('nav'),
          dots = a.data('dots'),
          center = a.data('center'),
          autoplay = a.data('autoplay'),
          autoplaySpeed = a.data('autoplay-speed'),
          rtl = a.data('rtl'),
          autoheight = a.data('autoheight');

        var options = {
          nav: nav || false,
          loop: loop || false,
          dots: dots || false,
          center: center || false,
          autoplay: autoplay || false,
          autoHeight: autoheight || false,
          rtl: rtl || false,
          margin: margin || 0,
          autoplayTimeout: autoplaySpeed || 3000,
          autoplaySpeed: 400,
          autoplayHoverPause: true,
          responsive: {
            0: { items: items[3] || 1 },
            992: { items: items[2] || 1 },
            1200: { items: items[1] || 1 },
            1600: { items: items[0] || 1}
          }
        };

        a.owlCarousel(options);

        // Custom Navigation Events
        $(document).on('click', '.owl-item>div', function() {
          $owl.trigger('to.owl.carousel', $(this).data( 'position' ) );
        });
      });
    },

    // Overlay Menu
    Overlay: function() {
      $(document).ready(function(){
        $('.overlay-menu-open').click(function(){
          $(this).toggleClass('active');
          $('html').toggleClass('active');
          $('.overlay-menu').toggleClass('active');
        });
      });
    },


    // File Tree
    Filetree: function() {
      var folder = $('.file-tree li.file-tree-folder'),
          file = $('.file-tree li');

      folder.on("click", function(a) {
          $(this).children('ul').slideToggle(400, function() {
              $(this).parent("li").toggleClass("open")
          }), a.stopPropagation()
      })

      file.on('click', function(b){
        b.stopPropagation();
      })
    },

    ImageView: function() {
      $('.lightbox').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        closeBtnInside: false,
        fixedContentPos: true,
        mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
        image: {
          verticalFit: true
        }
      });

      $('.gallery').each(function() { // the containers for all your galleries
          $(this).magnificPopup({
              delegate: '.photo > a', // the selector for gallery item
              type: 'image',
              mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
              gallery: {
                enabled:true
              }
          });
      });

    },


    // Apps
    Apps: function () {

      // accordion
      $(document).ready(function() {

        $('.collapse').on('show.bs.collapse', function () {
            $(this).parent().addClass('active');
        });

        $('.collapse').on('hide.bs.collapse', function () {
            $(this).parent().removeClass('active');
        });

      });


      // tooltips
      $('[data-toggle="tooltip"]').tooltip()



      // skrollr
      skrollr.init({  
          forceHeight: false,        
          mobileCheck: function() {
              //hack - forces mobile version to be off
              return false;
          }
      });


      // Smooth Scroll
      $(function () {
        var scroll = new SmoothScroll('[data-scroll]');
      });


      // Lavalamp
      $('.lavalamp').lavalamp({
        setOnClick: true,
        enableHover: false,
        margins: false,
        autoUpdate: true,
        duration: 200
      });


      $(document).ready(function(){
          var window_width = jQuery( window ).width();

          if (window_width < 768) {
            $(".sticky").trigger("sticky_kit:detach");
          } else {
            make_sticky();
          }


          $( window ).resize(function() {

            window_width = jQuery( window ).width();

            if (window_width < 768) {
              $(".sticky").trigger("sticky_kit:detach");
            } else {
              make_sticky();
            }

          });


          // recalc on collapse
          $('.nav-item .collapse').on('shown.bs.collapse hidden.bs.collapse', function () {
            $(".sticky").trigger("sticky_kit:recalc");
          });

          function make_sticky() {
            $(".sticky").stick_in_parent();
          }

      });


      // prism
      (function(){
        if (typeof self === 'undefined' || !self.Prism || !self.document) {
          return;
        }



        var callbacks = [];


      })();
    }
  };

  $(document).ready(function () {
    fn.Launch();
  });

})(jQuery);