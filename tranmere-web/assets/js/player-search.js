var seasonMapping = {
    "1978": 1977,
    "1984": 1983,
    "1990": 1989,
    "1992": 1991,
    "1994": 1993,
    "1996": 1995,
    "1998": 1997,
    "2001": 2000,
    "2003": 2002,
    "2005": 2006,
    "2008": 2007
}


function search() {
  $("#loading").show();
  $("#content").hide();
  var base = window.location.hostname == "www.tranmere-web.com" ? '' : "https://www.tranmere-web.com";
  var url = base + '/player-search/?season='+ $('#season').val()
              + '&sort=' + $('#sort').val();
  var re = /\/\d\d\d\d\//gm;
  var re2 = /\/\d\d\d\dgk\//gm;
  var re3 = /\/\d\d\d\d[A-Za-z]\//gm;
  $.getJSON(url, function(view) {
    $.get("/assets/templates/players.mustache", function(template) {

      if($('#season').val() && $('#season').val() > 1976) {
          for(var i=0; i < view.players.length; i++) {
            if(view.players[i].bio && view.players[i].bio.picLink) {
                var season = $('#season').val()
                if(seasonMapping[season])
                    season = seasonMapping[season]
                view.players[i].bio.picLink = view.players[i].bio.picLink.replace(re, '/'+season+'/')
                view.players[i].bio.picLink = view.players[i].bio.picLink.replace(re3, '/'+season+'/')
            }
          }
      }


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
        $('#season').val(2021);
    search();
});