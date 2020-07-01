const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200'
});
var Mustache = require("mustache");
var fs = require("fs");
var path = require('path');
var utils = require('./libs/utils')(path,fs,Mustache,client);

async function run () {

    utils.buildPage({title: "Home"}, "./templates/home.tpl.html",'./output/site/index.html' );
    utils.buildPage({title: "About the site"}, "./templates/about.tpl.html",'./output/site/about.html' );
    utils.buildPage({title: "Links"}, "./templates/links.tpl.html",'./output/site/links.html' );
    utils.buildPage({title: "Oops"}, "./templates/error.tpl.html",'./output/site/error.html' );
    utils.buildPage({title: "Contact Us"}, "./templates/contact.tpl.html",'./output/site/contact.html' );

    var seasonsView = {
        decades: [],
        title: "Season Index"
    };
    for(var y = 1920; y < 2020; y = y + 10) {
        var decade = {
            year: y,
            seasons: []
        };
        for(var x = y; x < y +10; x++) {
            if(x > 1920)
                decade.seasons.push({year:x, nextYear:x+1});
        }
        seasonsView.decades.push(decade);
    }
    utils.buildPage(seasonsView, "./templates/seasons.tpl.html",'./output/site/seasons.html' );


    var teams = await utils.findAllTeams(150);

    utils.buildPage({title: "Opposition Team Index",resultsByLetter: teams.resultsByLetter, teams:teams.results },
        "./templates/teams.tpl.html", './output/site/teams.html');

    for(var i=0; i<teams.results.length; i++ ) {
        var team = teams.results[i].key;
        var results = await utils.findAllTranmereMatchesByOpposition(team, 200);
        var meta = utils.calculateWinsDrawsLossesFromMatchesSearch(results.body.hits.hits);
        var teamView = {
            title: "Matches against " + team,
            wins: meta.wins,
            draws: meta.draws,
            losses: meta.losses,
            matches: results.body.hits.hits
        };
        utils.buildPage(teamView, "./templates/team.tpl.html", './output/site/teams/'+team+'.html');

    }
     var managersQuery = {
       index: "managers",
       body: {
          "sort": ["DateJoined"],
          "size": 200,
       }
     };
    var managers = await client.search(managersQuery);

    utils.buildPage({title: "Managerial Records",managers: managers.body.hits.hits},
        "./templates/managers.tpl.html", './output/site/managers.html');

     var playerQuery = {
       index: "players",
       body: {
          "sort": ["Name"],
          "size": 200,
       }
     };
    var players = await client.search(playerQuery);

    for(var i=0; i < players.body.hits.hits.length; i++) {
        if(players.body.hits.hits[i]["_source"]["Name"]) {
            var name = players.body.hits.hits[i]["_source"]["Name"];
            var goals = await utils.findGoalsByPlayer(name, 250);
            var apps = await utils.findAppsByPlayer(name, 250);

            var links= await utils.getLinksByPlayer(name);
            var stats = utils.calculateStats(apps, goals);
            var player = {
                title: name,
                games: apps,
                stats: stats,
                goals: goals,
                links: links.body.hits.hits
            };
            utils.buildPage(player,"./templates/player.tpl.html", './output/site/players/'+player.title+'.html');

            for(var x=0; x < stats.seasons.length; x++) {
                var g2 = await utils.findGoalsByPlayer(name, 250, stats.seasons[x].Season);
                var g = await utils.findAppsByPlayer(name, 250, stats.seasons[x].Season);
                utils.buildPage({name:name, title:name + ' record in season ' + stats.seasons[x].Season, games:g, goals: g2},"./templates/player-season.tpl.html", './output/site/player-season/'+name+'-'+stats.seasons[x].Season+'.html');
            }
        }
    }

    utils.buildPage({title: "Player Records",players: players.body.hits.hits},
        "./templates/players.tpl.html", './output/site/players.html');

    for(var i=0; i < managers.body.hits.hits.length; i++) {

        var dateLeft = "now";
        if(managers.body.hits.hits[i]["_source"].DateLeft)
            dateLeft = managers.body.hits.hits[i]["_source"].DateLeft;
        var results = await utils.findAllTranmereMatchesWithinTimePeriod(managers.body.hits.hits[i]["_source"].DateJoined,dateLeft,500);
        var meta = utils.calculateWinsDrawsLossesFromMatchesSearch(results.body.hits.hits);

        var managerView = {
            title: managers.body.hits.hits[i]["_source"].Name + "'s matches in charge ",
            dateFrom: managers.body.hits.hits[i]["_source"].DateJoined,
            dateTo: dateLeft,
            wins: meta.wins,
            draws: meta.draws,
            losses: meta.losses,
            matches: results.body.hits.hits
        };
        utils.buildPage(managerView, "./templates/manager.tpl.html", './output/site/managers/'+managers.body.hits.hits[i]["_id"]+'.html');
    }

    for(var i=1921; i < 2021; i++) {
        var results = await utils.findAllTranmereMatchesBySeason(i,200);
        var mySeasonView = {
            title: "Season " + i + "-" + (i+1),
            matches: results.body.hits.hits,
            next_season: i+1,
            previous_season: i-1,
        };

        var matches = [];
        for(var x=0; x < results.body.hits.hits.length; x++) {
            var match = results.body.hits.hits[x]["_source"];
            match.Opposition = match.home == "Tranmere Rovers" ? match.visitor : match.home;
            matches.push(match);
        }
        utils.buildPage({matches: matches}, "./templates/season.tpl.csv", './output/site/csv/'+i+'.csv');
        var myCSVView = {
            matches: results.body.hits.hits,
        };

        utils.buildPage(mySeasonView, "./templates/season.tpl.html", './output/site/seasons/'+i+'.html');
    }

    utils.buildPage({urls:utils.pages}, "./templates/sitemap.tpl.xml", './output/site/sitemap.xml');
}
run().catch(console.log)