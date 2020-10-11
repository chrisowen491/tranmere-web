$(document).ready(function() {

var formatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

  var url = 'https://www.tranmere-web.com/profile/'+ $("#PlayerName").html();

  $.getJSON(url, function(data) {

    var view = data;
    data.currencyFormat = function() {
        return function(text, render) {
          if(render(text) == "") {
            return "Undisclosed"
          }
          else if(parseInt(render(text)) == 0)
            return "Free Transfer"
          else {
            return formatter.format(parseInt(render(text)))
          }
        }
    };

    $.get("/assets/templates/player.mustache", function(template) {
      var article = Mustache.render( template, view );
      $("#profile").html(article);
    });

  });

});