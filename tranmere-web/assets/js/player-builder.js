function draw() {
  var base = "/builder/";
  var url = $('#kit').val() +'/' + $('#hair').val() + '/' + $('#skinColour').val() + '/'
    + $('#feature').val() + '/' + $('#colour').val() + '/' + $('#neckColour').val() + '/'
    + $('#background').val()+ '/' + $('#highlights').val();

  $.get("/assets/templates/builder.mustache", function(template) {
    var article = Mustache.render( template, {img: url, base: base} );
    $("#content").html(article);
  });
}


$(document).ready(function() {
    draw();
});