const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200'
});
var Mustache = require("mustache");
var fs = require("fs");
var path = require('path');
var utils = require('./libs/utils')(path,fs,Mustache,client);

async function run () {

    utils.buildPage({title: "Home", pageType:"WebPage", description: "Tranmere-Web.com is a website full of data, statistics and information about Tranmere Rovers FC"}, "./templates/home.tpl.html",'./output/site/index.html' );
    utils.buildPage({title: "About the site", pageType:"AboutPage", description: "All about Tranmere-Web"}, "./templates/about.tpl.html",'./output/site/about.html' );
    utils.buildPage({title: "Links", pageType:"WebPage", description: "Some popular Tranmere Rovers links from the web"}, "./templates/links.tpl.html",'./output/site/links.html' );
    utils.buildPage({title: "Oops", pageType:"WebPage"}, "./templates/error.tpl.html",'./output/site/error.html' );
    utils.buildPage({title: "Contact Us", pageType:"ContactPage", description: "How to contact us at Tranmere-Web"}, "./templates/contact.tpl.html",'./output/site/contact.html' );

    var seasonsView = {
        decades: [],
        title: "Results By Season",
        pageType:"WebPage",
        description: "All Tranmere Rovers seasons by decade"
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

    utils.buildPage({title: "Results BY Opposition Team", pageType:"WebPage", description:"Directory of opposition teams Tranmere Rovers has played against", resultsByLetter: teams.resultsByLetter, teams:teams.results },
        "./templates/teams.tpl.html", './output/site/teams.html');

    for(var i=0; i<teams.results.length; i++ ) {
        var team = teams.results[i].key;
        var results = await utils.findAllTranmereMatchesByOpposition(team, 200);
        var meta = utils.calculateWinsDrawsLossesFromMatchesSearch(results);
        var teamView = {
            title: "Matches against " + team,
            wins: meta.wins,
            draws: meta.draws,
            losses: meta.losses,
            matches: results,
            pageType:"WebPage",
            description: "Full results of all Tranmere Rovers matches against " + team
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

    utils.buildPage({title: "Tranmere Rovers Managerial Records",managers: managers.body.hits.hits, pageType:"WebPage",  description: "Records of all Tranmere Rovers managers"},
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
                links: links.body.hits.hits,
                pageType:"ProfilePage",
                description: "Information about " + name + "'s record playing for Tranmere Rovers"
            };
            utils.buildPage(player,"./templates/player.tpl.html", './output/site/players/'+player.title+'.html');

            for(var x=0; x < stats.seasons.length; x++) {
                var g2 = await utils.findGoalsByPlayer(name, 250, stats.seasons[x].Season);
                var g = await utils.findAppsByPlayer(name, 250, stats.seasons[x].Season);
                var title = name + ' record in season ' + stats.seasons[x].Season;
                var description = "Full playing record of " + name + " during the " + stats.seasons[x].Season + " Tranmere Rovers season"
                utils.buildPage({name:name, title:title , pageType:"WebPage", description:description,  games:g, goals: g2},"./templates/player-season.tpl.html", './output/site/player-season/'+name+'-'+stats.seasons[x].Season+'.html');
            }
        }
    }

    utils.buildPage({title: "Tranmere Rovers Player Records",players: players.body.hits.hits, pageType:"WebPage", description: "LIst of Tranmere Rovers players records "},
        "./templates/players.tpl.html", './output/site/players.html');

    for(var i=0; i < managers.body.hits.hits.length; i++) {

        var dateLeft = "now";
        if(managers.body.hits.hits[i]["_source"].DateLeft)
            dateLeft = managers.body.hits.hits[i]["_source"].DateLeft;
        var results = await utils.findAllTranmereMatchesWithinTimePeriod(managers.body.hits.hits[i]["_source"].DateJoined,dateLeft,500);
        var meta = utils.calculateWinsDrawsLossesFromMatchesSearch(results);

        var managerView = {
            title: managers.body.hits.hits[i]["_source"].Name + "'s matches in charge ",
            dateFrom: managers.body.hits.hits[i]["_source"].DateJoined,
            dateTo: dateLeft,
            wins: meta.wins,
            draws: meta.draws,
            losses: meta.losses,
            matches: results,
            pageType:"ProfilePage",
            description: "Record of " + managers.body.hits.hits[i]["_source"].Name + " as Tranmere Rovers manager"
        };
        utils.buildPage(managerView, "./templates/manager.tpl.html", './output/site/managers/'+managers.body.hits.hits[i]["_id"]+'.html');
    }

    for(var i=1921; i < 2021; i++) {
        var results = await utils.findAllTranmereMatchesBySeason(i,200);
        var mySeasonView = {
            title: "Season " + i + "-" + (i+1),
            pageType:"WebPage",
            description: "Tranmere Rovers results in " + i + " season",
            matches: results,
            next_season: i+1,
            previous_season: i-1,
        };

        var matches = [];
        for(var x=0; x < results.length; x++) {
            var match = results[x];
            match.Opposition = match.home == "Tranmere Rovers" ? match.visitor : match.home;
            matches.push(match);
        }
        utils.buildPage({matches: matches}, "./templates/season.tpl.csv", './output/site/csv/'+i+'.csv');
        utils.buildPage(mySeasonView, "./templates/season.tpl.html", './output/site/seasons/'+i+'.html');
    }

    utils.buildPage({urls:utils.pages}, "./templates/sitemap.tpl.xml", './output/site/sitemap.xml');
}
run().catch(console.log)