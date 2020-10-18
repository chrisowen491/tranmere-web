const Mustache = require("mustache");
const fs = require("fs");
const path = require('path');
const axios = require('axios')
const contentful = require("contentful");
const contentfulSDK = require('@contentful/rich-text-html-renderer');
const client = contentful.createClient({
  space: process.env.CF_SPACE,
  accessToken: process.env.CF_KEY
});

var utils = require('./tranmere-web/libs/utils')(path,fs,Mustache,axios, process.env.API_KEY);

async function run () {

    if (!fs.existsSync('./tranmere-web/output')){
        fs.mkdirSync('./tranmere-web/output');
    }
    if (!fs.existsSync('./tranmere-web/output/site')){
        fs.mkdirSync('./tranmere-web/output/site');
    }

    var content = await client.getEntries({'content_type': 'blogPost', order: '-fields.datePosted'});
    var links = await client.getEntries({'content_type': 'internalLinks'});
    var pages = await client.getEntries({'content_type': 'pageMetaData'});

    var pageCategories = {};
    for(var i=0; i < links.items.length; i++) {
        var item = links.items[i];
        if(pageCategories[item.fields.pageCategory]) {

            if(pageCategories[item.fields.pageCategory].groups[item.fields.groupCategory]) {
               pageCategories[item.fields.pageCategory].groups[item.fields.groupCategory].push(item.fields);
            } else {
                pageCategories[item.fields.pageCategory].groups[item.fields.groupCategory] = [item.fields];
            }
        } else {
            pageCategories[item.fields.pageCategory] = { groups: {} };
            pageCategories[item.fields.pageCategory].groups[item.fields.groupCategory] = [item.fields]
        }
    }

    var kits = [
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
   ];
    var seasons = [];
    for(var i = 2020; i > 1920; i--) {
        seasons.push(i);
        utils.addSiteMapEntry("/results.html?season="+i);
    }
    var teams = await utils.findAllTeams(200);
    var competitions =  await utils.getAllCupCompetitions(50);
    var managers = await utils.findAllTranmereManagers();
    var players = await utils.findAllPlayers();
    var stars = await utils.findTranmereMatchesWithStars(20);
    var topScorers =  await utils.getTopScorersBySeason();
    for(var i=0; i < pages.items.length; i++) {
        var page = pages.items[i].fields;
        page.blogs = content.items;
        let options = {
          renderNode: {
            'embedded-asset-block': (node) =>
              `<img src="${node.data.target.fields.file.url}"/>`
          }
        }
        page.content =  contentfulSDK.documentToHtmlString(page.body, options);
        page.kits = kits;
        page.teams = teams;
        page.managers = managers;
        page.competitions = competitions;
        page.seasons = seasons;
        page.stars = stars;
        page.image = utils.buildImagePath("photos/kop.jpg", 1920,1080);
        if(pageCategories[page.key]) {
            var groups = [];
            for (const key in pageCategories[page.key].groups) {
                groups.push({groupName: key, links : pageCategories[page.key].groups[key]})
            }
            page.groups = groups;
        }
        var fileName = page.key.toLowerCase();
        utils.buildPage(page,`./tranmere-web/templates/${page.template}`,`./tranmere-web/output/site/${fileName}.html` );
    }

    // Graphs
    //utils.buildPage({graph:fs.readFileSync('./tranmere-web/graphs/attendances.js', 'utf8'), title: "Average League Home Attendance", pageType:"WebPage", description: "Average Tranmere Rovers League Attendance By Season",blogs: content.items}, "./tranmere-web/templates/graph.tpl.html",'./tranmere-web/output/site/graph-attendances.html' );
    //utils.buildPage({graph:fs.readFileSync('./tranmere-web/graphs/tiers.js', 'utf8'), title: "Tranmere's League Tiers", pageType:"WebPage", description: "Tranmere Rovers League Tiers By Season",blogs: content.items}, "./tranmere-web/templates/graph.tpl.html",'./tranmere-web/output/site/graph-tiers.html' );

    for(var i=0; i < players.length; i++) {
        utils.addSiteMapEntry("/page/player/"+players[i].name);
    }

    utils.buildPage({urls:utils.pages}, "./tranmere-web/templates/sitemap.tpl.xml", './tranmere-web/output/site/sitemap.xml');
}
run().catch(console.log)