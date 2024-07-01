import Mustache from 'mustache';
import '../../../templates/partials/results.mustache';
import pack from '../../../package.json';

var dateobj = new Date();
var theYear =
  dateobj.getUTCMonth() > 6 ? dateobj.getFullYear() : dateobj.getFullYear() - 1;

function search() {
  $('#loading').show();
  $('#content').hide();
  var base = '';
  var url =
    base +
    '/result-search/?season=' +
    $('#season').val() +
    '&competition=' +
    $('#competition').val() +
    '&opposition=' +
    encodeURIComponent($('#opposition').val()) +
    '&manager=' +
    $('#manager').val() +
    '&venue=' +
    $('#venue').val() +
    '&pens=' +
    $('#pens').val() +
    '&sort=' +
    $('#sort').val() +
    '&c=' +
    dateobj.getDate();
  $.getJSON(url, function (data) {
    var view = {
      results: data.results,
      h2hresults: data.h2hresults,
      h2htotal: data.h2htotal
    };
    $.get(
      '/assets/templates/results.mustache' + '?v=' + pack.version,
      function (template) {
        var article = Mustache.render(template, view);
        $('#results-search').html(article);
        $('#loading').hide();
        $('#results-search').show();
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
  if ($('#results-search').length) {
    if ($("meta[name='season-ssr-id']").length) {
      $('#season').val($("meta[name='season-ssr-id']").attr('content'));
    }
    if ($("meta[name='venue-ssr-id']").length) {
      $('#venue').val($("meta[name='venue-ssr-id']").attr('content'));
    }
    if ($("meta[name='pens-ssr-id']").length) {
      $('#pens').val($("meta[name='pens-ssr-id']").attr('content'));
    }
    if ($("meta[name='opposition-ssr-id']").length) {
      $('#opposition').val($("meta[name='opposition-ssr-id']").attr('content'));
    }
    if ($("meta[name='sort-ssr-id']").length) {
      $('#sort').val($("meta[name='sort-ssr-id']").attr('content'));
    }
    if ($.urlParam('season')) $('#season').val($.urlParam('season'));
    if ($.urlParam('opposition'))
      $('#opposition').val(decodeURIComponent($.urlParam('opposition')));
    if ($.urlParam('competition'))
      $('#competition').val(decodeURIComponent($.urlParam('competition')));
    if ($.urlParam('venue'))
      $('#venue').val(decodeURIComponent($.urlParam('venue')));
    if ($.urlParam('pens'))
      $('#pens').val(decodeURIComponent($.urlParam('pens')));
    if ($.urlParam('sort'))
      $('#sort').val(decodeURIComponent($.urlParam('sort')));
    if ($.urlParam('manager')) $('#manager').val($.urlParam('manager'));
    if (
      !$('#season').val() &&
      !$('#manager').val() &&
      !$('#opposition').val() &&
      !$('#competition').val() &&
      !$('#venue').val() &&
      !$('#pens').val() &&
      (!$('#sort').val() || $('#sort').val() == 'Date')
    )
      $('#season').val(theYear);

    if ($("meta[name='results-ssr-id']").length) {
      $('#loading').hide();
    } else {
      search();
    }
    $('.btn-results-search').on('click', function () {
      search();
    });
  }
});
