function draw() {
  var url = $('#kit').val() +'/' + $('#hair').val() + '/' + $('#skinColour').val() + '/' + $('#feature').val() + '/' + $('#colour').val() + '/' + $('#neckColour').val();

  $.get("/assets/templates/builder.mustache", function(template) {
    var article = Mustache.render( template, {img: url} );
    $("#content").html(article);
  });
}


$(document).ready(function() {
    draw();
});