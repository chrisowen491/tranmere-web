function search() {
  $("#loading").show();
  $("#content").hide();
  var base = window.location.hostname == "www.tranmere-web.com" ? null : "https://www.tranmere-web.com";
  var url = base + '/result-search/?season='+ $('#season').val()
              + '&competition='+ $('#competition').val()
              + '&opposition=' + $('#opposition').val().replace('&','%26')
              + '&manager=' + $('#manager').val()
              + '&venue=' + $('#venue').val()
              + '&pens=' + $('#pens').val()
              + '&sort=' + $('#sort').val();
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
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.search);
    return (results !== null) ? results[1] || 0 : false;
}

$(document).ready(function() {

    if($.urlParam('season'))
        $('#season').val($.urlParam('season'));
    if($.urlParam('opposition'))
        $('#opposition').val(decodeURIComponent($.urlParam('opposition')));
    if($.urlParam('competition'))
        $('#competition').val(decodeURIComponent($.urlParam('competition')));
    if($.urlParam('venue'))
        $('#venue').val(decodeURIComponent($.urlParam('venue')));
    if($.urlParam('pens'))
        $('#pens').val(decodeURIComponent($.urlParam('pens')));
    if($.urlParam('sort'))
        $('#sort').val(decodeURIComponent($.urlParam('sort')));
    if($.urlParam('manager'))
        $('#manager').val($.urlParam('manager'));
    if(!$('#season').val() && !$.urlParam('manager') && !$.urlParam('opposition') && !$.urlParam('competition') && !$.urlParam('venue') && !$.urlParam('pens') && !$.urlParam('sort'))
        $('#season').val(2020);

    search();
});