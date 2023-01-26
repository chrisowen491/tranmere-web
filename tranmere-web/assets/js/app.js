window.DD_LOGS && window.DD_LOGS.onReady(function() {
  window.DD_LOGS.init({
    clientToken: 'pub91e87345f76af7acb5aa202805d95df0',
    site: 'datadoghq.eu',
    service: 'www.tranmere-web.com',
    env: 'prod',
    version: '@version@',
    forwardErrorsToLogs: true,
    forwardConsoleLogs: "all",
    sampleRate: 100,
  })
})
window.DD_RUM && window.DD_RUM.init({
  clientToken: 'pub91e87345f76af7acb5aa202805d95df0',
  applicationId: 'bb11809d-d51b-408d-9be4-cacc89c65d63',
  site: 'datadoghq.eu',
  service: 'www.tranmere-web.com',
  env: 'prod',
  version: '@version@',
  sampleRate: 100,
  premiumSampleRate: 100,
  trackInteractions: true,
  trackResources: true,
  defaultPrivacyLevel: 'mask-user-input',
  allowedTracingOrigins: ["https://www.tranmere-web.com", /https:\/\/.*\.tranmere-web\.com/]
});

window.DD_RUM &&
window.DD_RUM.startSessionReplayRecording();

(function ($) {
  "use strict";

  var fn = {

    // Launch Functions
    Launch: function () {
      fn.Overlay();
      fn.Filetree();
      fn.OwlCarousel();
      fn.ImageView();
      fn.Apps();
      fn.Auth();
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
      jQuery(function () {
        $('.overlay-menu-open').on('click',function(){
          $(this).toggleClass('active');
          $('html').toggleClass('active');
          $('.overlay-menu').toggleClass('active');
        });
      });
    },

    Auth: function() {

      jQuery(function () {
        var authData = {
            ClientId : "3civek6bpngorkivrntf5ai4ro",
            AppWebDomain : 'auth.tranmere-web.com',
            TokenScopesArray : ['TranmereWeb/matches.read'],
            RedirectUriSignIn : 'https://www.tranmere-web.com/',
            RedirectUriSignOut : 'https://www.tranmere-web.com/',
            UserPoolId : "eu-west-1_GAF4md6wn"
        };
        var auth = new AmazonCognitoIdentity.CognitoAuth(authData);
        window.auth = auth;
        auth.userhandler = {
            onSuccess: function(result) {
                $("#loginout").html('Sign Out');
                auth.setState("signedIn");
                $('#edit').show();
            },
            onFailure: function(err) {
                alert("Error!" + err);
            }
        };
        if(auth.storage['CognitoIdentityServiceProvider.3civek6bpngorkivrntf5ai4ro.LastAuthUser']) {
            $('#edit').show();
            auth.getSession();
        }
        $(document).on('click', '#loginout', function() {
            if ($("#loginout").html() === "Sign Out") {
                auth.signOut();
                $("#loginout").html('Sign In');
            } else {
                auth.getSession();
            }
        });
        auth.parseCognitoWebResponse(window.location.href);
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
      jQuery(function () {

        $('.collapse').on('show.bs.collapse', function () {
            $(this).parent().addClass('active');
        });

        $('.collapse').on('hide.bs.collapse', function () {
            $(this).parent().removeClass('active');
        });
      });


      // tooltips
      $('[data-toggle="tooltip"]').tooltip()

      jQuery(function () {
          var window_width = jQuery( window ).width();

          // recalc on collapse
          $('.nav-item .collapse').on('shown.bs.collapse hidden.bs.collapse', function () {
            $(".sticky").trigger("sticky_kit:recalc");
          });

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

  jQuery(function () {
    fn.Launch();
  });

  jQuery(function () {
    if ($('#onthisday').length) {
      var dateobj = new Date();
      var day = dateobj.toISOString().slice(0, 10).substr(5);
      var base = "";
      var url = base + '/graphql?query=' + encodeURIComponent(`{getTranmereWebOnThisDayById(day: "${day}"){opposition programme hgoal vgoal season}}`);
      $.getJSON(url, function(response) {
        if(response && response.data.listTranmereWebOnThisDay.items.length > 0) {
          var view = response.data.listTranmereWebOnThisDay.items[0];
          var largeBody = {
              "bucket": 'trfc-programmes',
              "key": view.programme,
          };
          view.largeprogramme = btoa(JSON.stringify(largeBody));
          $.get("/assets/templates/onthisday.mustache"+ '?c=' + dateobj.getDate(), function(template) {
            var article = Mustache.render( template, view );
            $("#onthisday").html(article);
          });
        }
      });
    }
  });

})(jQuery);

var client = algoliasearch('DZJXSVOWI3', 'c050f0bd17ccfde9aa78a3563d552db2');
var index = client.initIndex('TranmereWeb');
autocomplete('#search-input', { hint: false }, [
{
  source: autocomplete.sources.hits(index, { hitsPerPage: 5 }),
  displayKey: 'name',
  templates: {
    suggestion: function(suggestion) {
        if(suggestion.picLink)
            return "<img width='40px' src='"+suggestion.picLink+"'/>" + suggestion.name;
        else
            return suggestion.name;
    }
  }
}
]).on('autocomplete:selected', function(event, suggestion, dataset) {
    window.location.href = suggestion.link;
});