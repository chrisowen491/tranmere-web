const Mustache = require('mustache');
import '../templates/lastmatch.mustache';
const pack = require('../../../package.json');

jQuery(function () {
  if ($('#lastmatch').length) {
    var dateobj = new Date();
    var url =
      '/result-search/?season=2023&competition=&opposition=&manager=&venue=&pens=&sort=Date' +
      '&c=' +
      dateobj.getDate();
    $.getJSON(url, function (response) {
      if (response && response.results) {
        var idx = response.results.length;
        var view = response.results[idx - 1];
        if (view.programme) {
          var largeBody = {
            bucket: 'trfc-programmes',
            key: view.programme,
            edits: {
              resize: {
                width: 200,
                fit: 'contain'
              }
            }
          };
          view.largeprogramme = btoa(JSON.stringify(largeBody));
        }
        $.get(
          '/assets/templates/lastmatch.mustache?v=' + pack.version,
          function (template) {
            var article = Mustache.render(template, view);
            $('#lastmatch').html(article);
          }
        );
      }
    });
  }
});
