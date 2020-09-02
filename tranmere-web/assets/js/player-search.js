function search() {
  $("#loading").show();
  $("#content").hide();
  var url = 'https://www.tranmere-web.com/player-search/?season='+ $('#season').val()
              + '&sort=' + $('#sort').val();
  $.getJSON(url, function(view) {
    $.get("/assets/templates/players.mustache", function(template) {
      var article = Mustache.render( template, view );
      $("#content").html(article);
      $("#loading").hide();
      $("#content").show();
    });
  });
}
$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}

$(document).ready(function() {

    if($.urlParam('season'))
        $('#season').val($.urlParam('season'));

    $('#sort').val(decodeURIComponent($.urlParam('sort')));
    if(!$('#season').val() && !$.urlParam('sort'))
        $('#season').val(2019);
    search();
});