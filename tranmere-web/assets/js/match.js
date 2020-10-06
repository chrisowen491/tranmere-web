$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}

function search() {
  var url = 'https://www.tranmere-web.com/result-search/?date='+ $.urlParam('date') + "&season=" + $.urlParam('season');
  $.getJSON(url, function(view) {
    $.get("/assets/templates/match.mustache", function(template) {
      var article = Mustache.render( template, view );
      $("#homenav").after(article);
      $("#loading").hide();
    });
  });
}


$(document).ready(function() {
    search();
});