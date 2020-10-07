$(document).ready(function() {

var formatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

  var url = 'https://www.tranmere-web.com/entities/TranmereWebPlayerTable/name/'+ $("#PlayerName").html();

  $.getJSON(url, function(data) {
    if(data.message.length == 1) {
        $.get("/assets/templates/player.mustache", function(template) {
          var article = Mustache.render( template, data.message[0] );
          $("#profile").html(article);
        });
    }
  });

  var linksUrl = 'https://www.tranmere-web.com/entities/TranmereWebPlayerLinks/name/'+ $("#PlayerName").html();

  $.getJSON(linksUrl, function(data) {
    $.get("/assets/templates/links.mustache", function(template) {
      var article = Mustache.render( template, data );
      $("#pnlLinks").html(article);
    });
  });

  var statsUrl = 'https://www.tranmere-web.com/entities/TranmereWebPlayerSeasonSummaryTable/Player/'+$("#PlayerName").html()+'?index=ByPlayerIndex';

  $.getJSON(statsUrl, function(data) {
    $.get("/assets/templates/stats.mustache", function(template) {
      var article = Mustache.render( template, data );
      $("#pnlStats").html(article);
    });
  });

  var transfersUrl = 'https://www.tranmere-web.com/entities/TranmereWebPlayerTransfers/name/'+ $("#PlayerName").html();

  $.getJSON(transfersUrl, function(data) {

     var transfers = [];
     for(var i=0; i < data.message.length; i++) {
       var transfer = data.message[i];
       if(transfer.direction == "In")
        transfer.incoming = true;
       if(transfer.type == "Loan" || transfer.type == "Youth" || transfer.type == "FreeTransfer" || transfer.type == "Retired" || transfer.type == "Released")
        transfer.noFee = true;
       if(transfer.type == "Loan" || transfer.type == "Youth" || transfer.type == "FreeTransfer" || transfer.type == "Tribunal" || transfer.type == "Retired" || transfer.type == "Released")
        transfer.other = true;
       if(transfer.type == "Youth" )
         transfer.type = "Tranmere Youth Team"
       transfers.push(transfer)
     }


    var view = {
        transfers: transfers,
        currencyFormat: function() {
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
        }
    }
    $.get("/assets/templates/transfers.mustache", function(template) {
      var article = Mustache.render( template, view );
      $("#pnlTransfers").html(article);
    });
  });

});