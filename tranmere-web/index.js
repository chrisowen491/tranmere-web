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
    utils.buildPage({title: "Opposition Team Index",teams: teams.body.aggregations.teams.buckets},
        "./templates/teams.tpl.html", './output/site/teams.html');

    for(var i=0; i<teams.body.aggregations.teams.buckets.length; i++ ) {
        var team = teams.body.aggregations.teams.buckets[i].key;
        if(team != "Tranmere Rovers") {
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
        utils.buildPage(mySeasonView, "./templates/season.tpl.html", './output/site/seasons/'+i+'.html');
    }
}
run().catch(console.log)