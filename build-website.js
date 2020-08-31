const { Client } = require('@elastic/elasticsearch')
const client = new Client({
    cloud: {
        id: process.env.es_cluster,
      },
      auth: {
        username: process.env.es_user,
        password: process.env.es_password
      }
});
var Mustache = require("mustache");
var excel = require('excel4node');
var fs = require("fs");
var path = require('path');
var utils = require('./tranmere-web/libs/utils')(path,fs,Mustache,client);
var formatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

async function run () {

    if (!fs.existsSync('./tranmere-web/output/site/media')){
        fs.mkdirSync('./tranmere-web/output/site/media');
    }
    if (!fs.existsSync('./tranmere-web/output/site/competitions')){
        fs.mkdirSync('./tranmere-web/output/site/competitions');
    }
    if (!fs.existsSync('./tranmere-web/output/site/managers')){
        fs.mkdirSync('./tranmere-web/output/site/managers');
    }
    if (!fs.existsSync('./tranmere-web/output/site/players')){
        fs.mkdirSync('./tranmere-web/output/site/players');
    }
    if (!fs.existsSync('./tranmere-web/output/site/seasons')){
        fs.mkdirSync('./tranmere-web/output/site/seasons');
    }
    if (!fs.existsSync('./tranmere-web/output/site/teams')){
        fs.mkdirSync('./tranmere-web/output/site/teams');
    }
    if (!fs.existsSync('./tranmere-web/output/site/player-season')){
        fs.mkdirSync('./tranmere-web/output/site/player-season');
    }


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
                {
                    image: "Screenshot4.png",
                    title: "Results By Season",
                    link: "/seasons.html",
                },
                {
                    image: "Screenshot5.png",
                    title: "Fanzines Gallery",
                    link: "/media/fanzines.html",
                },
            ]

        },
        "./tranmere-web/templates/home2.tpl.html",'./tranmere-web/output/site/index.html' );


    utils.buildPage(
        {
            title: "Tranmere Kits",
            pageType:"WebPage",
            description: "Historic Tranmere Kits",
            kits: [
                {
                    Season: "1984-1985",
                    image: "/assets/shirts/1985.svg",
                },
                {
                    Season: "1986-1987",
                    image: "/assets/shirts/1986.svg",
                },
                {
                    Season: "1987-1989",
                    image: "/assets/shirts/1988.svg",
                },
                {
                    Season: "1989-1991",
                    image: "/assets/shirts/1989.svg",
                },
                {
                    Season: "1991-1993",
                    image: "/assets/shirts/1991.svg",
                },
                {
                    Season: "1993-1995",
                    image: "/assets/shirts/1993.svg",
                },
                {
                    Season: "1995-1997",
                    image: "/assets/shirts/1995.svg",
                },
                {
                    Season: "1997-1999",
                    image: "/assets/shirts/1997.svg",
                },
                {
                    Season: "1999-2000",
                    image: "/assets/shirts/1999.svg",
                },
                {
                    Season: "2000-2002",
                    image: "/assets/shirts/2000.svg",
                },
                {
                    Season: "2002-2004",
                    image: "/assets/shirts/2002.svg",
                },
                {
                    Season: "2004-2006",
                    image: "/assets/shirts/2004.svg",
                },
                {
                    Season: "2005-2007",
                    image: "/assets/shirts/2006.svg",
                },
                {
                    Season: "2007-2009",
                    image: "/assets/shirts/2007.svg",
                },
                {
                    Season: "2010-2011",
                    image: "/assets/shirts/2010.svg",
                },
                {
                    Season: "2011-2013",
                    image: "/assets/shirts/2011.svg",
                },
                {
                    Season: "2013-2014",
                    image: "/assets/shirts/2013.svg",
                },
                {
                    Season: "2015-2016",
                    image: "/assets/shirts/2015.svg",
                },
                {
                    Season: "2016-2017",
                    image: "/assets/shirts/2016.svg",
                },
                {
                    Season: "2017-2018",
                    image: "/assets/shirts/2017.svg",
                },
                {
                    Season: "2018-2019",
                    image: "/assets/shirts/2018.svg",
                },
                {
                    Season: "2019-2020",
                    image: "/assets/shirts/2019.svg",
                }
            ]

        },
        "./tranmere-web/templates/kits.tpl.html",'./tranmere-web/output/site/media/kits.html' );

    utils.buildPage({title: "About the site", pageType:"AboutPage", description: "All about Tranmere-Web"}, "./tranmere-web/templates/about.tpl.html",'./tranmere-web/output/site/about.html' );
    utils.buildPage({title: "Links", pageType:"WebPage", description: "Some popular Tranmere Rovers links from the web"}, "./tranmere-web/templates/links.tpl.html",'./tranmere-web/output/site/links.html' );
    utils.buildPage({title: "Players Home", pageType:"WebPage", description: "Tranmere Rovers player information index"}, "./tranmere-web/templates/players-home.tpl.html",'./tranmere-web/output/site/players.html' );
    utils.buildPage({title: "Results Home", pageType:"WebPage", description: "Tranmere Rovers results information index"}, "./tranmere-web/templates/results-home.tpl.html",'./tranmere-web/output/site/results.html' );
    utils.buildPage({title: "Stats Home", pageType:"WebPage", description: "Tranmere Rovers statistics"}, "./tranmere-web/templates/stats-home.tpl.html",'./tranmere-web/output/site/stats.html' );
    utils.buildPage({title: "Media Home", pageType:"WebPage", description: "Tranmere Rovers media"}, "./tranmere-web/templates/media-home.tpl.html",'./tranmere-web/output/site/media.html' );


    utils.buildPage(
        {
            title: "Tranmere Rovers Books",
            pageType:"WebPage",
            description: "Published books about Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Book', 25)
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/books.html' );

    utils.buildPage(
        {
            title: "Tranmere Rovers Football Videos",
            pageType:"WebPage",
            description: "Videos & DVSs Featuring Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Video', 25)
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/videos.html' );

    utils.buildPage(
        {
            title: "Tranmere Rovers Football Cards",
            pageType:"WebPage",
            description: "Football Cards Featuring Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Card', 25)
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/cards.html' );

    utils.buildPage(
        {
            title: "Tranmere Rovers Fanzines",
            pageType:"WebPage",
            description: "Fanzines about Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Fanzine', 50)
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/fanzines.html' );

    utils.buildPage(
        {
            title: "Newspaper Specials",
            pageType:"WebPage",
            description: "Newspaper Specials about Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Newspaper', 50)
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/newspapers.html' );

    // Graphs
    utils.buildPage({graph:fs.readFileSync('./tranmere-web/graphs/attendances.js', 'utf8'), title: "Average League Home Attendance", pageType:"WebPage", description: "Average Tranmere Rovers League Attendance By Season"}, "./tranmere-web/templates/graph.tpl.html",'./tranmere-web/output/site/graph-attendances.html' );
    utils.buildPage({graph:fs.readFileSync('./tranmere-web/graphs/tiers.js', 'utf8'), title: "Tranmere's League Tiers", pageType:"WebPage", description: "Tranmere Rovers League Tiers By Season"}, "./tranmere-web/templates/graph.tpl.html",'./tranmere-web/output/site/graph-tiers.html' );

    utils.buildPage({title: "Oops", pageType:"WebPage"}, "./tranmere-web/templates/error.tpl.html",'./tranmere-web/output/site/error.html' , true);
    utils.buildPage({title: "Contact Us", pageType:"ContactPage", description: "How to contact us at Tranmere-Web"}, "./tranmere-web/templates/contact.tpl.html",'./tranmere-web/output/site/contact.html' );

/*

    var competitionView = {
        competitions: await utils.getAllCupCompetitions(50),
        title: "Results By Competition",
        pageType:"WebPage",
        description: "All Tranmere Rovers seasons by cup competition"
    };
    utils.buildPage(competitionView, "./tranmere-web/templates/competitions.tpl.html",'./tranmere-web/output/site/competitions.html' );

    var wembleyView = {
        matches: await utils.findAllTranmereMatchesByVenue('Wembley Stadium'),
        title: "Results at Wembley",
        pageType:"WebPage",
        image: utils.buildImagePath("photos/Wembley2.jpeg", 1920,1080),
        description: "All Tranmere Rovers matches at Wembley Stadium"
    };
    utils.buildPage(wembleyView, "./tranmere-web/templates/competition.tpl.html",'./tranmere-web/output/site/wembley.html' );

    var penaltyView = {
        matches: await utils.findTranmereMatchesWithPenalties(20),
        title: "Tranmere in Penalty Shootouts",
        pageType:"WebPage",
        image: utils.buildImagePath("photos/Wembley3.jpeg", 1920,1080),
        description: "All Tranmere Rovers matches with penalty shootouts"
    };
    utils.buildPage(penaltyView, "./tranmere-web/templates/competition.tpl.html",'./tranmere-web/output/site/penalty-shootouts.html' );

    var starsView = {
        matches: await utils.findTranmereMatchesWithStars(20),
        title: "Stars  at Prenton Park",
        pageType:"WebPage",
        image: utils.buildImagePath("photos/manutd.jpg", 1920,1080),
        description: "List of famous players to have played against Tranmere Rovers at Prenton Park"
    };
    utils.buildPage(starsView, "./tranmere-web/templates/stars.tpl.html",'./tranmere-web/output/site/super-stars.html' );


    var attendanceView = {
        matches: await utils.findTranmereMatchesSortedByTopAttendance(50),
        title: "Tranmere Matches With Top Attendances",
        pageType:"WebPage",
        description: "The highest attendances for any Tranmere Rovers match",
        commaFormat: function() {
            return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    };
    utils.buildPage(attendanceView, "./tranmere-web/templates/attendances.tpl.html",'./tranmere-web/output/site/attendances.html' );

    var ppAttendanceView = {
        matches: await utils.findTranmereMatchesSortedByTopAttendanceAtHome(50),
        title: "Top Attendances at Prenton Park",
        pageType:"WebPage",
        description: "The highest attendances for any Tranmere Rovers at Prenton Park",
        commaFormat: function() {
            return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    };
    utils.buildPage(ppAttendanceView, "./tranmere-web/templates/attendances.tpl.html",'./tranmere-web/output/site/prenton-park-attendances.html' );


    var appsView = {
        players: await utils.getTopPlayerByAppearances(20),
        title: "Most Tranmere Rovers Appearances",
        pageType:"WebPage",
        description: "List of players with most appearances for Tranmere Rovers"
    };
    utils.buildPage(appsView, "./tranmere-web/templates/appearances.tpl.html",'./tranmere-web/output/site/appearances.html' );

    var goalsView = {
        players: await utils.getTopPlayerByGoals(20),
        title: "Most Tranmere Rovers Goals",
        pageType:"WebPage",
        description: "List of players with most goals for Tranmere Rovers"
    };
    utils.buildPage(goalsView, "./tranmere-web/templates/goals.tpl.html",'./tranmere-web/output/site/goals.html' );

    var topScorersView = {
        players: await utils.getTopScorersBySeason(50),
        title: "Top Scorers BY Season",
        pageType:"WebPage",
        description: "Tranmere Rovers Top Scorers By Season"
    };
    utils.buildPage(topScorersView, "./tranmere-web/templates/goals.tpl.html",'./tranmere-web/output/site/top-scorers-by-season.html' );


    for(var c=0; c < competitionView.competitions.length; c++) {
        var compView = {
                matches: await utils.findAllTranmereMatchesByCompetition(competitionView.competitions[c].Name,200),
                title: "Results in " + competitionView.competitions[c].Name,
                pageType:"WebPage",
                image: utils.buildImagePath("photos/cowshed.jpg", 1920,1080),
                description: "All Tranmere Rovers seasons in " + competitionView.competitions[c].Name
        };
        utils.buildPage(compView, "./tranmere-web/templates/competition.tpl.html",'./tranmere-web/output/site/competitions/'+competitionView.competitions[c].Name+'.html' );

    }

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
    utils.buildPage(seasonsView, "./tranmere-web/templates/seasons.tpl.html",'./tranmere-web/output/site/seasons.html' );

    var teams = await utils.findAllTeams(200);

    utils.buildPage({title: "Results By Opposition Team", pageType:"WebPage", description:"Directory of opposition teams Tranmere Rovers has played against", resultsByLetter: teams.resultsByLetter, teams:teams.results },
        "./tranmere-web/templates/teams.tpl.html", './tranmere-web/output/site/teams.html');

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
            image: utils.buildImagePath("photos/manutd.jpg", 1920,1080),
            pageType:"WebPage",
            description: "Full results of all Tranmere Rovers matches against " + team
        };
        utils.buildPage(teamView, "./tranmere-web/templates/team.tpl.html", './tranmere-web/output/site/teams/'+team+'.html');

    }

    var managers = await utils.findAllTranmereManagers(200);

    utils.buildPage({title: "Tranmere Rovers Managerial Records",managers: managers, pageType:"WebPage",  description: "Records of all Tranmere Rovers managers"},
        "./tranmere-web/templates/managers.tpl.html", './tranmere-web/output/site/managers.html');

    for(var i=0; i < managers.length; i++) {

        var results = await utils.findAllTranmereMatchesWithinTimePeriod(managers[i].DateJoined,managers[i].DateLeft,500);
        var meta = utils.calculateWinsDrawsLossesFromMatchesSearch(results);

        var managerView = {
            title: managers[i].Name + "'s matches in charge ",
            image: utils.buildImagePath("photos/kop.jpg", 1920,1080),
            dateFrom: managers[i].DateJoined,
            dateTo: managers[i].DateLeftText,
            wins: meta.wins,
            draws: meta.draws,
            losses: meta.losses,
            matches: results,
            pageType:"ProfilePage",
            description: "Record of " + managers[i].Name + " as Tranmere Rovers manager"
        };
        utils.buildPage(managerView, "./tranmere-web/templates/manager.tpl.html", './tranmere-web/output/site/managers/'+managers[i].Name+'.html');
    }

    var players = await utils.findAllPlayers(2000);
    var playersByLetter = await utils.findAllPlayersByLetterAndDates(300, '1980-01-01', '1990-01-01');
    utils.buildPage({title: "Players Records - 1980's", pageType:"WebPage", description:"Directory of player records for Tranmere Rovers players in the 1980's", resultsByLetter: playersByLetter.resultsByLetter, players:playersByLetter.results },
        "./tranmere-web/templates/players.tpl.html", './tranmere-web/output/site/players-80s.html');
    playersByLetter = await utils.findAllPlayersByLetterAndDates(300, '1990-01-01', '2000-01-01');
    utils.buildPage({title: "Players Records - 1990's", pageType:"WebPage", description:"Directory of player records for Tranmere Rovers players in the 1990's", resultsByLetter: playersByLetter.resultsByLetter, players:playersByLetter.results },
        "./tranmere-web/templates/players.tpl.html", './tranmere-web/output/site/players-90s.html');
    playersByLetter = await utils.findAllPlayersByLetterAndDates(300, '2000-01-01', '2010-01-01');
    utils.buildPage({title: "Players Records - 2000's", pageType:"WebPage", description:"Directory of player records for Tranmere Rovers players in the 2000's", resultsByLetter: playersByLetter.resultsByLetter, players:playersByLetter.results },
        "./tranmere-web/templates/players.tpl.html", './tranmere-web/output/site/players-00s.html');
    playersByLetter = await utils.findAllPlayersByLetterAndDates(300, '2010-01-01', '2030-01-01');
    utils.buildPage({title: "Players Records - 2010's", pageType:"WebPage", description:"Directory of player records for Tranmere Rovers players in the 2010's", resultsByLetter: playersByLetter.resultsByLetter, players:playersByLetter.results },
        "./tranmere-web/templates/players.tpl.html", './tranmere-web/output/site/players-10s.html');

    for(var i=0; i < players.length; i++) {
        if(players[i].Name) {
            var player = {
                title: players[i].Name,
                games: players[i].apps,
                stats: players[i].stats,
                goals: players[i].goals,
                links: players[i].links,
                pic:   players[i].Pic,
                image: utils.buildImagePath("photos/kop.jpg", 1920,1080),
                transfers: await utils.getTransfersByPlayer(players[i].Name, 20),
                pageType:"ProfilePage",
                description: "Information about " + players[i].Name + "'s record playing for Tranmere Rovers",
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
            };
            utils.buildPage(player,"./tranmere-web/templates/player.tpl.html", './tranmere-web/output/site/players/' + players[i].Name + '.html');

            for(var x=0; x < players[i].stats.seasons.length; x++) {
                var view = {
                   name: players[i].Name,
                   title: players[i].Name + ' record in season ' + players[i].stats.seasons[x].Season,
                   pageType: "WebPage",
                   image: utils.buildImagePath("photos/kop.jpg", 1920,1080),
                   description: "Full playing record of " + players[i].Name + " during the " + players[i].stats.seasons[x].Season + " Tranmere Rovers season",
                   games: await utils.findAppsByPlayer(players[i].Name, 70, players[i].stats.seasons[x].Season),
                   goals: await utils.findGoalsByPlayer(players[i].Name, 70, players[i].stats.seasons[x].Season)
                };
                utils.buildPage(view,
                    "./tranmere-web/templates/player-season.tpl.html",
                    './tranmere-web/output/site/player-season/' + players[i].Name + '-' + players[i].stats.seasons[x].Season + '.html'
                );
            }
        }
    }

    for(var i=1921; i < 2021; i++) {
        var results = await utils.findAllTranmereMatchesBySeason(i,200);
        var mySeasonView = {
            title: "Season " + i + "-" + (i+1),
            pageType:"WebPage",
            image: utils.buildImagePath("photos/kop.jpg", 1920,1080),
            description: "Tranmere Rovers results in " + i + " season",
            matches: results,
            next_season: i+1,
            previous_season: i-1,
            showProgrammes: true
        };

        var workbook = new excel.Workbook();

        var maxSquadNumber = 13;
        if(i > 1998)
            maxSquadNumber = 41;

        for(var y=1; y <maxSquadNumber; y++) {
            var worksheet = null;
            if(y != maxSquadNumber-1) {
                worksheet = workbook.addWorksheet(y);
                worksheet.cell(1,1).string('Date');
                worksheet.cell(1,2).string('Opposition');
                worksheet.cell(1,3).string('Competition');
                worksheet.cell(1,4).string('Season');
                worksheet.cell(1,5).string('Name');
                worksheet.cell(1,6).string('Number');
                worksheet.cell(1,7).string('SubbedBy');
                worksheet.cell(1,8).string('SubTime');
                worksheet.cell(1,9).string('YellowCard');
                worksheet.cell(1,10).string('RedCard');
                worksheet.cell(1,11).string('SubYellow');
                worksheet.cell(1,12).string('SubRed');
                for(var x=0; x < results.length; x++) {
                    if(results[x]) {
                        worksheet.cell(x+2,1).string(results[x].Date);
                        worksheet.cell(x+2,2).string(results[x].Opposition);
                        worksheet.cell(x+2,3).string(results[x].competition);
                        worksheet.cell(x+2,4).string(results[x].Season);
                        worksheet.cell(x+2,6).number(y);
                    }
                }
            }
            else{
                worksheet = workbook.addWorksheet("goals");
                worksheet.cell(1,1).string('Date');
                worksheet.cell(1,2).string('Opposition');
                worksheet.cell(1,3).string('Competition');
                worksheet.cell(1,4).string('Season');
                worksheet.cell(1,5).string('Scorer');
                worksheet.cell(1,6).string('Assist');
                worksheet.cell(1,7).string('GoalType');
                worksheet.cell(1,8).string('AssistType');
                worksheet.cell(1,9).string('Minute');
                worksheet.cell(1,10).string('6YardBox');
                worksheet.cell(1,11).string('18YardBox');
                worksheet.cell(1,12).string('LongRange');
                worksheet.cell(1,13).string('CrossSide');
                worksheet.cell(1,14).string('Foot');
                var currentRow =1;
                for(var z=0; z < results.length; z++) {
                    if(results[z].home == "Tranmere Rovers") {
                        for(var g=0; g < results[z].hgoal; g++) {
                            var currentRow = currentRow+1;
                            worksheet.cell(currentRow,1).string(results[z].Date);
                            worksheet.cell(currentRow,2).string(results[z].Opposition);
                            worksheet.cell(currentRow,3).string(results[z].competition);
                            worksheet.cell(currentRow,4).string(results[z].Season);
                        }
                    } else {
                        for(var g=0; g<results[z].vgoal; g++) {
                            var currentRow = currentRow+1;
                            worksheet.cell(currentRow,1).string(results[z].Date);
                            worksheet.cell(currentRow,2).string(results[z].Opposition);
                            worksheet.cell(currentRow,3).string(results[z].competition);
                            worksheet.cell(currentRow,4).string(results[z].Season);
                        }
                    }
                }
            }
        }
        workbook.write('tmp/apps-master/raw/'+i+'.xlsx');
        utils.buildPage(mySeasonView, "./tranmere-web/templates/season.tpl.html", './tranmere-web/output/site/seasons/'+i+'.html');
    }

    utils.buildPage({urls:utils.pages}, "./tranmere-web/templates/sitemap.tpl.xml", './tranmere-web/output/site/sitemap.xml');
*/
}
run().catch(console.log)