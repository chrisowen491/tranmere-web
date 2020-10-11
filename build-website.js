var Mustache = require("mustache");
var fs = require("fs");
var path = require('path');
var axios = require('axios')
var utils = require('./tranmere-web/libs/utils')(path,fs,Mustache,axios);

async function run () {

    if (!fs.existsSync('./tranmere-web/output')){
        fs.mkdirSync('./tranmere-web/output');
    }
    if (!fs.existsSync('./tranmere-web/output/site')){
        fs.mkdirSync('./tranmere-web/output/site');
    }
    if (!fs.existsSync('./tranmere-web/output/site/media')){
        fs.mkdirSync('./tranmere-web/output/site/media');
    }
    if (!fs.existsSync('./tranmere-web/output/site/players')){
        fs.mkdirSync('./tranmere-web/output/site/players');
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
    utils.buildPage({title: "Stats Home", pageType:"WebPage", description: "Tranmere Rovers statistics"}, "./tranmere-web/templates/stats-home.tpl.html",'./tranmere-web/output/site/stats.html' );
    utils.buildPage({title: "Media Home", pageType:"WebPage", description: "Tranmere Rovers media"}, "./tranmere-web/templates/media-home.tpl.html",'./tranmere-web/output/site/media.html' );

    utils.buildPage({title: "Match Summary", pageType:"WebPage", description: "Match Summary"}, "./tranmere-web/templates/match.tpl.html",'./tranmere-web/output/site/match.html' );


    var seasons = [];
    for(var i = 2020; i > 1920; i--) {
        seasons.push(i)
    }

    var teams = await utils.findAllTeams(200);
    var competitions =  await utils.getAllCupCompetitions(50);

    var managers = await utils.findAllTranmereManagers();

    utils.buildPage({title: "Results Home", pageType:"WebPage", description: "Tranmere Rovers results information index", teams: teams, managers: managers, competitions: competitions, seasons: seasons}, "./tranmere-web/templates/results-home.tpl.html",'./tranmere-web/output/site/results.html' );

    utils.buildPage({title: "Players Home", pageType:"WebPage", description: "Tranmere Rovers player information index", seasons: seasons}, "./tranmere-web/templates/player-search.tpl.html",'./tranmere-web/output/site/player-search.html' );

    /* Media */
    utils.buildPage(
        {
            title: "Tranmere Rovers Books",
            pageType:"WebPage",
            description: "Published books about Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Book')
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/books.html' );

    utils.buildPage(
        {
            title: "Tranmere Rovers Football Videos",
            pageType:"WebPage",
            description: "Videos & DVSs Featuring Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Video')
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/videos.html' );

    utils.buildPage(
        {
            title: "Tranmere Rovers Football Cards",
            pageType:"WebPage",
            description: "Football Cards Featuring Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Card')
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/cards.html' );

    utils.buildPage(
        {
            title: "Tranmere Rovers Fanzines",
            pageType:"WebPage",
            description: "Fanzines about Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Fanzine')
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/fanzines.html' );

    utils.buildPage(
        {
            title: "Newspaper Specials",
            pageType:"WebPage",
            description: "Newspaper Specials about Tranmere Rovers",
            carousel: await utils.getAllMediaByType('Newspaper')
        },
        "./tranmere-web/templates/gallery.tpl.html",'./tranmere-web/output/site/media/newspapers.html' );

    // Graphs
    utils.buildPage({graph:fs.readFileSync('./tranmere-web/graphs/attendances.js', 'utf8'), title: "Average League Home Attendance", pageType:"WebPage", description: "Average Tranmere Rovers League Attendance By Season"}, "./tranmere-web/templates/graph.tpl.html",'./tranmere-web/output/site/graph-attendances.html' );
    utils.buildPage({graph:fs.readFileSync('./tranmere-web/graphs/tiers.js', 'utf8'), title: "Tranmere's League Tiers", pageType:"WebPage", description: "Tranmere Rovers League Tiers By Season"}, "./tranmere-web/templates/graph.tpl.html",'./tranmere-web/output/site/graph-tiers.html' );

    utils.buildPage({title: "Oops", pageType:"WebPage"}, "./tranmere-web/templates/error.tpl.html",'./tranmere-web/output/site/error.html' , true);
    utils.buildPage({title: "Contact Us", pageType:"ContactPage", description: "How to contact us at Tranmere-Web"}, "./tranmere-web/templates/contact.tpl.html",'./tranmere-web/output/site/contact.html' );

    var starsView = {
        matches: await utils.findTranmereMatchesWithStars(20),
        title: "Stars  at Prenton Park",
        pageType:"WebPage",
        image: utils.buildImagePath("photos/manutd.jpg", 1920,1080),
        description: "List of famous players to have played against Tranmere Rovers at Prenton Park"
    };
    utils.buildPage(starsView, "./tranmere-web/templates/stars.tpl.html",'./tranmere-web/output/site/super-stars.html' );


    var topScorersView = {
        players: await utils.getTopScorersBySeason(),
        title: "Top Scorers By Season",
        pageType:"WebPage",
        description: "Tranmere Rovers Top Scorers By Season"
    };
    utils.buildPage(topScorersView, "./tranmere-web/templates/goals.tpl.html",'./tranmere-web/output/site/top-scorers-by-season.html' );

    utils.buildPage({title: "Tranmere Rovers Managerial Records",managers: managers, pageType:"WebPage",  description: "Records of all Tranmere Rovers managers"},
        "./tranmere-web/templates/managers.tpl.html", './tranmere-web/output/site/managers.html');
/*
    var players = await utils.findAllPlayers();

    for(var i=0; i < players.length; i++) {
        if(players[i].name) {
            var player = {
                title: players[i].name,
                games: players[i].apps,
                goals: players[i].goals,
                pic:   players[i].pic,
                image: utils.buildImagePath("photos/kop.jpg", 1920,1080),
                pageType:"ProfilePage",
                description: "Information about " + players[i].name + "'s record playing for Tranmere Rovers"
            };
            utils.buildPage(player,"./tranmere-web/templates/player.tpl.html", './tranmere-web/output/site/players/' + players[i].name + '.html');
*/
/*
            for(var x=0; x < players[i].stats.seasons.length; x++) {
                var view = {
                   name: players[i].name,
                   title: players[i].name + ' record in season ' + players[i].stats.seasons[x].Season,
                   pageType: "WebPage",
                   image: utils.buildImagePath("photos/kop.jpg", 1920,1080),
                   description: "Full playing record of " + players[i].name + " during the " + players[i].stats.seasons[x].Season + " Tranmere Rovers season",
                   games: await utils.findAppsByPlayer(players[i].name, 70, players[i].stats.seasons[x].Season),
                   goals: await utils.findGoalsByPlayer(players[i].name, 70, players[i].stats.seasons[x].Season)
                };
                utils.buildPage(view,
                    "./tranmere-web/templates/player-season.tpl.html",
                    './tranmere-web/output/site/player-season/' + players[i].name + '-' + players[i].stats.seasons[x].Season + '.html'
                );
            }
*/
/*
        }
    }
*/
    utils.buildPage({urls:utils.pages}, "./tranmere-web/templates/sitemap.tpl.xml", './tranmere-web/output/site/sitemap.xml');
}
run().catch(console.log)