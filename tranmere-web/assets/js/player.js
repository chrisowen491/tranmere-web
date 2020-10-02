$(document).ready(function() {

  var url = 'https://www.tranmere-web.com/api-player/'+ $("#PlayerName").html();


  $.getJSON(url, function(data) {
    if(data.length == 1) {
        $.get("/assets/templates/player.mustache", function(template) {
          var article = Mustache.render( template, data[0] );
          $("#profile").html(article);
        });
    }
  });

});