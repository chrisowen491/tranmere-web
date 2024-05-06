import Mustache from 'mustache';
import '../../../templates/partials/results.mustache';
import pack from '../../../package.json';

function search(or) {
  $(`#${or}-five-loading`).show();
  $(`#${or}-five-content`).hide();
  var dateobj = new Date();
  var url = `/result-search/?season=${window.season}&date=${window.date}&or=${or}&c=${dateobj.getDate()}`;
  $.getJSON(url, function (data) {
    $.get(
      '/assets/templates/results.mustache?v=' + pack.version,
      function (template) {
        $(`#${or}-five-content`).html(
          Mustache.render(template, { results: data.results })
        );
        $(`#${or}-five-loading`).hide();
        $(`#${or}-five-content`).show();
      }
    );
  });
}

$(document).ready(function () {
  if ($('#match').length) {
    search('next');
    search('previous');
  }
});

$(document).on('click', '#editbutton2', function () {
  var data = {
    programme: $('#programme').val(),
    attendance: $('#attendance').val(),
    youtube: $('#youtube').val(),
    home: $('#home').val(),
    visitor: $('#visitor').val(),
    opposition: $('#opposition').val(),
    pens: $('#pens').val(),
    venue: $('#venue').val(),
    hgoal: $('#hgoal').val(),
    vgoal: $('#vgoal').val()
  };

  $.ajax({
    type: 'POST',
    dataType: 'json',
    crossDomain: 'true',
    contentType: 'application/json; charset=utf-8',
    data: JSON.stringify(data),
    headers: {
      Authorization: window.auth
        .getCachedSession()
        .getAccessToken()
        .getJwtToken()
    },
    success: function () {
      window.location.href =
        window.location.href + '?v=' + Math.floor(Math.random() * 10);
    },
    error: function () {
      alert('fail');
    }
  });
});
