var globalStore = {};

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.search);

    return (results !== null) ? results[1] || 0 : false;
}

function search() {
  $.when(
    // Get the HTML
    $.get("/assets/templates/match.mustache", function(template) {
      globalStore.template = template;
    }),

    $.get("https://www.tranmere-web.com/player-search/?season="+$.urlParam('season')+"&sort=null&x=true7", function(players) {
      globalStore.players = players;
    }),


    $.get('https://www.tranmere-web.com/result-search/?date='+ $.urlParam('date') + "&season=" + $.urlParam('season'), function(match) {
      globalStore.match = match;
    }),

    // Get the JS
    //$.getScript("/assets/feature.js")

  ).then(function() {

       var playerMap = {};
       var view = globalStore.match;
       view.goalkeepers = [];
       view.fullback1 = [];
       view.fullback2 = [];
       view.defenders = [];
       view.midfielders = [];
       view.wingers1 = [];
       view.wingers2 = [];
       view.strikers = [];
       view.formattedGoals = formatGoals(view.goals);
       for (var i=0; i < globalStore.players.players.length; i++) {
        playerMap[globalStore.players.players[i].Player] = globalStore.players.players[i].bio;
       }

       var noPositionList = [];
       for(var i=0; i < globalStore.match.apps.length; i++) {
        var app = globalStore.match.apps[i];
        if(playerMap[app.Name]) {

            app.bio = playerMap[globalStore.match.apps[i].Name];

            if(app.bio.position == "Goalkeeper") {
                view.goalkeepers.push(app);
            } else if(app.bio.position == "Central Defender") {
                view.defenders.push(app);
            } else if(app.bio.position == "Full Back" && view.fullback1.length == 0) {
                view.fullback1.push(app);
            } else if(app.bio.position == "Full Back" && view.fullback2.length == 0) {
                view.fullback2.push(app);
            } else if(app.bio.position == "Central Midfielder") {
                view.midfielders.push(app);
            } else if(app.bio.position == "Winger" && view.wingers1.length == 0) {
                view.wingers1.push(app);
            } else if(app.bio.position == "Winger" && view.wingers2.length == 0) {
                view.wingers2.push(app);
            } else if(app.bio.position == "Striker") {
                view.strikers.push(app);
            } else {
                noPositionList.push(app)
            }
        } else {
            app.bio = {
                pic: {
                     fields:{
                         file:{
                             url:"https://images.ctfassets.net/pz711f8blqyy/1GOdp93iMC7T3l9L9UUqaM/0ea20a8950cdfb6f0239788f93747d74/blank.svg"
                         }
                     }
                 }
            }     ;
            noPositionList.push(app);
        }
       }

       for(var i=0; i < noPositionList.length; i++) {
            if(view.goalkeepers.length == 0){
                view.goalkeepers.push(noPositionList[i]);
            } else if(view.fullback1.length == 0){
                  view.fullback1.push(noPositionList[i]);
            } else if(view.fullback2.length == 0){
                  view.fullback2.push(noPositionList[i]);
            } else if(view.defenders.length < 2){
                view.defenders.push(noPositionList[i]);
            } else if(view.wingers1.length == 0){
                  view.wingers1.push(noPositionList[i]);
            } else if(view.wingers2.length == 0){
                  view.wingers2.push(noPositionList[i]);
            } else if(view.midfielders.length < 2){
                view.midfielders.push(noPositionList[i]);
            } else {
                view.strikers.push(noPositionList[i]);
            }
       }

       view.defColspan  = 20 / (view.defenders.length + view.fullback1.length + view.fullback2.length);
       view.midColspan  = 20 / (view.midfielders.length + view.wingers1.length + view.wingers2.length);
       view.strColspan = 20 / view.strikers.length;

       var article = Mustache.render( globalStore.template, view );
       $("#homenav").after(article);
       $("#loading").hide();
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