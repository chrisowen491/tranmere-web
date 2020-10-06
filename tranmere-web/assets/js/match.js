$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}


function search() {
  var url = 'https://www.tranmere-web.com/result-search/?date='+ $.urlParam('date') + "&season=" + $.urlParam('season');
  $.getJSON(url, function(view) {
    view.formattedGoals = formatGoals(view.goals);
    $.get("/assets/templates/match.mustache", function(template) {
      var article = Mustache.render( template, view );
      $("#homenav").after(article);
      $("#loading").hide();
    });
  });
}

function formatGoals(goals) {
    var output = "";
    var scorers = {};
    for(var i=0; i < goals.length; i++) {
        if(scorers[goals[i].Scorer]) {
           scorers[goals[i].Scorer] =  scorers[goals[i].Scorer] + 1;
        } else {
           scorers[goals[i].Scorer] = 1;
        }
    }
    const keys = Object.keys(scorers);
    for( var x=0; x < keys.length; x++) {
        if(scorers[keys[x]] > 1) {
            output = output + keys[x] + " " + scorers[keys[x]];
        } else {
            output = output + keys[x]
        }
        if( x != keys.length-1) {
            output = output + ", "
        }
    }
    return output;
 }

$(document).ready(function() {
    search();
});