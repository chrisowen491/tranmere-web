const Mustache = require('mustache');
import '../../../templates/partials/onthisday.mustache';
const pack = require('../../../package.json');

jQuery(function () {
  if ($('#onthisday').length) {
    var dateobj = new Date();
    var day = dateobj.toISOString().slice(0, 10).substr(5);
    var base = '';
    var url =
      base +
      '/graphql?query=' +
      encodeURIComponent(
        `{getTranmereWebOnThisDayById(day: "${day}"){opposition programme hgoal vgoal season date home visitor}}`
      );
    $.getJSON(url, function (response) {
      if (response && response.data.getTranmereWebOnThisDayById) {
        var view = response.data.getTranmereWebOnThisDayById;
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
        $.get(
          '/assets/templates/onthisday.mustache?v=' + pack.version,
          function (template) {
            var article = Mustache.render(template, view);
            $('#onthisday').html(article);
          }
        );
      }
    });
  }
});
