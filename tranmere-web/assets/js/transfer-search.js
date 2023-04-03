const Mustache = require("mustache");
import '../templates/transfers.mustache';
const pack = require('../../../package.json');

function search() {
  $("#loading").show();
  $("#content").hide();
  var dateobj = new Date();
  var base = "";
  var url = base + '/transfer-search/?season='+ $('#season').val()
              + '&filter=' + $('#filter').val()
              + '&club=' + encodeURIComponent($('#club').val())
              + '&c=' + dateobj.getDate();
  $.getJSON(url, function(view) {
    $.get("/assets/templates/transfers.mustache?v=" + pack.version, function(template) {

      var article = Mustache.render( template, view );
      $("#transfer-search").html(article);
      $("#loading").hide();
      $("#transfer-search").show();
    });
  });
}
$.urlParam = function (name) {
    var results = new RegExp('[?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}

jQuery(function () {

    if ($('#transfer-search').length) {
        if($.urlParam('season'))
            $('#season').val($.urlParam('season'));
        if($.urlParam('filter'))
            $('#filter').val(decodeURIComponent($.urlParam('filter')));
        if($.urlParam('club'))
            $('#club').val(decodeURIComponent($.urlParam('club')));
        search();
        $('.btn-transfer-search').on('click',function(){
            search();
        });
        
    }
});