const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200'
});
var Mustache = require("mustache");
var fs = require("fs");
var path = require('path');
var utils = require('./libs/utils')(path,fs,Mustache,client);

async function run () {

    utils.buildPage(
        {
            title: "Home",
            pageType:"WebPage",
            description: "Tranmere-Web.com is a website full of data, statistics and information about Tranmere Rovers FC",
            carousel: [
                {
                    image: "Screenshot1.png",
                    title: "Results By Opposition",
                    link: "/teams.html",
                },
                {
                    image: "Screenshot2.png",
                    title: "Player Records",
                    link: "/players.html",
                },
                {
                    image: "Screenshot3.png",
                    title: "Results By Season",
                    link: "/seasons.html",
                },
            ]

        },
        "./templates/home.tpl.html",'./output/site/index.html' );
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

    var managers = await utils.findAllTranmereManagers(200);

    utils.buildPage({title: "Tranmere Rovers Managerial Records",managers: managers, pageType:"WebPage",  description: "Records of all Tranmere Rovers managers"},
        "./templates/managers.tpl.html", './output/site/managers.html');

    for(var i=0; i < managers.length; i++) {

        var results = await utils.findAllTranmereMatchesWithinTimePeriod(managers[i].DateJoined,managers[i].DateLeft,500);
        var meta = utils.calculateWinsDrawsLossesFromMatchesSearch(results);

        var managerView = {
            title: managers[i].Name + "'s matches in charge ",
            dateFrom: managers[i].DateJoined,
            dateTo: managers[i].DateLeftText,
            wins: meta.wins,
            draws: meta.draws,
            losses: meta.losses,
            matches: results,
            pageType:"ProfilePage",
            description: "Record of " + managers[i].Name + " as Tranmere Rovers manager"
        };
        utils.buildPage(managerView, "./templates/manager.tpl.html", './output/site/managers/'+managers[i].Id+'.html');
    }

     var playerQuery = {
       index: "players",
       body: {
          "sort": ["Name"],
          "size": 200,
       }
     };
    var players = await utils.findAllPlayers(200);

    for(var i=0; i < players.length; i++) {
        if(players[i].Name) {

            var player = {
                title: players[i].Name,
                games: players[i].apps,
                stats: players[i].stats,
                goals: players[i].goals,
                links: players[i].links,
                pageType:"ProfilePage",
                description: "Information about " + players[i].Name + "'s record playing for Tranmere Rovers"
            };
            utils.buildPage(player,"./templates/player.tpl.html", './output/site/players/' + players[i].Name + '.html');

            for(var x=0; x < players[i].stats.seasons.length; x++) {
                var view = {
                   name: players[i].Name,
                   title: players[i].Name + ' record in season ' + players[i].stats.seasons[x].Season,
                   pageType: "WebPage",
                   description: "Full playing record of " + players[i].Name + " during the " + players[i].stats.seasons[x].Season + " Tranmere Rovers season",
                   games: await utils.findAppsByPlayer(players[i].Name, 250, players[i].stats.seasons[x].Season),
                   goals: await utils.findGoalsByPlayer(players[i].Name, 250, players[i].stats.seasons[x].Season)
                };
                utils.buildPage(view,
                    "./templates/player-season.tpl.html",
                    './output/site/player-season/' + players[i].Name + '-' + players[i].stats.seasons[x].Season + '.html'
                );
            }
        }
    }

    utils.buildPage({title: "Tranmere Rovers Player Records",players: players, pageType:"WebPage", description: "List of Tranmere Rovers players records "},
        "./templates/players.tpl.html", './output/site/players.html');

    for(var i=1921; i < 2021; i++) {
        var results = await utils.findAllTranmereMatchesBySeason(i,200);
        var mySeasonView = {
            title: "Season " + i + "-" + (i+1),
            pageType:"WebPage",
            description: "Tranmere Rovers results in " + i + " season",
            matches: results,
            next_season: i+1,
            previous_season: i-1,
            showProgrammes: true
        };

        utils.buildPage({matches: results}, "./templates/season.tpl.csv", './output/site/csv/'+i+'.csv');
        utils.buildPage(mySeasonView, "./templates/season.tpl.html", './output/site/seasons/'+i+'.html');
    }

    utils.buildPage({urls:utils.pages}, "./templates/sitemap.tpl.xml", './output/site/sitemap.xml');
}
run().catch(console.log)