import Mustache from 'mustache';
import '../../../templates/partials/last-match.mustache';
import pack from '../../../package.json';

jQuery(function () {
  if ($('#lastmatch').length) {
    var dateobj = new Date();
    var theYear =
      dateobj.getUTCMonth() > 6
        ? dateobj.getFullYear()
        : dateobj.getFullYear() - 1;
    var url = `/result-search/?season=${theYear}&competition=&opposition=&manager=&venue=&pens=&sort=Date&c=${dateobj.getDate()}`;
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
          '/assets/templates/last-match.mustache?v=' + pack.version,
          function (template) {
            var article = Mustache.render(template, view);
            $('#lastmatch').html(article);
          }
        );
      }
    });
  }
});
