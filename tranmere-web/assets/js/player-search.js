import Mustache from 'mustache';
import '../../../templates/partials/players.mustache';
import pack from '../../../package.json';

var seasonMapping = {
  1978: 1977,
  1984: 1983,
  1990: 1989,
  1992: 1991,
  1994: 1993,
  1996: 1995,
  1998: 1997,
  2001: 2000,
  2003: 2002,
  2005: 2006,
  2008: 2007
};

var dateobj = new Date();
var theYear =
  dateobj.getUTCMonth() > 6 ? dateobj.getFullYear() : dateobj.getFullYear() - 1;

function search() {
  $('#loading').show();
  $('#content').hide();
  var base = '';
  var url =
    base +
    '/player-search/?season=' +
    $('#season').val() +
    '&sort=' +
    $('#sort').val() +
    '&filter=' +
    $('#filter').val() +
    '&c=' +
    dateobj.getDate();
  var re = /\/\d\d\d\d\//gm;
  var re3 = /\/\d\d\d\d[A-Za-z]\//gm;
  $.getJSON(url, function (view) {
    $.get(
      '/assets/templates/players.mustache?v=' + pack.version,
      function (template) {
        if ($('#season').val() && $('#season').val() > 1976) {
          for (var i = 0; i < view.players.length; i++) {
            if (view.players[i].bio && view.players[i].bio.picLink) {
              var season = $('#season').val();
              if (seasonMapping[season]) season = seasonMapping[season];
              view.players[i].bio.picLink = view.players[i].bio.picLink.replace(
                re,
                '/' + season + '/'
              );
              view.players[i].bio.picLink = view.players[i].bio.picLink.replace(
                re3,
                '/' + season + '/'
              );
            }
          }
        }

        var article = Mustache.render(template, view);
        $('#player-search').html(article);
        $('#loading').hide();
        $('#player-search').show();
      }
    );
  });
}
$.urlParam = function (name) {
  var results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
    window.location.search
  );

  return results !== null ? results[1] || 0 : false;
};

jQuery(function () {
  if ($('#player-search').length) {
    if ($("meta[name='season-ssr-id']").length) {
      $('#season').val($("meta[name='season-ssr-id']").attr('content'));
    }
    if ($("meta[name='filter-ssr-id']").length) {
      $('#filter').val($("meta[name='filter-ssr-id']").attr('content'));
    }
    if ($("meta[name='sort-ssr-id']").length) {
      $('#sort').val($("meta[name='sort-ssr-id']").attr('content'));
    }

    if ($.urlParam('season')) {
      $('#season').val($.urlParam('season'));
    }

    if ($.urlParam('sort'))
      $('#sort').val(decodeURIComponent($.urlParam('sort')));

    if ($.urlParam('filter'))
      $('#filter').val(decodeURIComponent($.urlParam('filter')));

    if (!$('#season').val() && !$('#filter').val() && !$('#sort').val()) {
      $('#season').val(theYear);
    }

    if ($("meta[name='players-ssr-id']").length) {
      $('#loading').hide();
    } else {
      if (!$.urlParam('season')) {
        $('#season').val(theYear);
      }
      search();
    }

    $('.btn-player-search').on('click', function () {
      search();
    });
  }
});
