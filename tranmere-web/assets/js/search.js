function search() {
  $("#loading").show();
  $("#content").hide();
  var url = 'https://www.tranmere-web.com/search/?season='+ $('#season').val()
              + '&competition='+ $('#competition').val() + '&opposition=' + $('#opposition').val()
              + '&manager=' + $('#manager').val();
  $.getJSON(url, function(data) {
    var view = {
        results: data
    };
    $.get("/assets/templates/results.mustache", function(template) {
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
    if($.urlParam('opposition'))
        $('#opposition').val($.urlParam('opposition'));
    if($.urlParam('competition'))
        $('#competition').val($.urlParam('competition'));
    if($.urlParam('manager'))
        $('#manager').val($.urlParam('manager'));
    if(!$('#season').val())
        $('#season').val(2019);
    search();
});