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

    var seasons = [];
    for(var i = 2020; i > 1920; i--) {
        seasons.push(i);
        utils.addSiteMapEntry("/results.html?season="+i);
    }
    var teams = []//await utils.findAllTeams(200);
    var competitions =  []//await utils.getAllCupCompetitions(50);
    var players = []//await utils.findAllPlayers();
    var managers = []//await utils.findAllTranmereManagers();
    var topScorers =  []//await utils.getTopScorersBySeason();

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

        page.topScorers = topScorers;
        page.managers = managers;
        page.teams = teams;
        page.competitions = competitions;
        page.seasons = seasons;
        page.image = utils.buildImagePath("photos/kop.jpg", 1920,1080);
        if(pageCategories[page.key]) {
            var groups = [];
            for (const key in pageCategories[page.key].groups) {
                groups.push({groupName: key, links : pageCategories[page.key].groups[key]})
            }
            page.groups = groups;
        }
        if(groups && groups.length > 0) {
            page.hasGroups = true;
            page.groups = groups;
        }
        if(page.sections) {
            var sectionContent = "";
            for(var s=0; s<page.sections.length; s++) {
                sectionContent = sectionContent + "\n" + utils.renderFragment(page, page.sections[s]);
            }
            page.sectionHTML = sectionContent;
        }
        if(page.blocks) {
            var blockContent = "";
            for(var b=0; b<page.blocks.length; b++) {
                blockContent = blockContent + "\n" + utils.renderFragment(page.blocks[b].fields, page.blocks[b].sys.contentType.sys.id);
            }
            page.blockHTML = blockContent;

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