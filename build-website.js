const Mustache = require("mustache");
const fs = require("fs");
const path = require('path');
const axios = require('axios')
const contentful = require("contentful");
const contentfulSDK = require('@contentful/rich-text-html-renderer');
const algoliasearch = require('algoliasearch');
const client = contentful.createClient({
  space: process.env.CF_SPACE,
  accessToken: process.env.CF_KEY
});
const search_client = algoliasearch(process.env.AL_SPACE, process.env.AL_KEY);
const search_index = search_client.initIndex(process.env.AL_INDEX);

var utils = require('./tranmere-web/libs/utils')(path, fs, Mustache, axios, process.env.API_KEY);
async function run () {

    if (!fs.existsSync('./tranmere-web/output')){
        fs.mkdirSync('./tranmere-web/output');
    }
    if (!fs.existsSync('./tranmere-web/output/site')){
        fs.mkdirSync('./tranmere-web/output/site');
    }

    var content = await client.getEntries({'content_type': 'blogPost', order: '-fields.datePosted'});
    var pages = await client.getEntries({'content_type': 'pageMetaData'});

    var seasons = [];
    var theDate = new Date();
    var theYear = theDate.getUTCMonth > 6 ? theDate.getFullYear() : theDate.getFullYear() -1;

    for(var i = theYear; i > 1920; i--) {
        seasons.push(i);
        utils.addSiteMapEntry("/results.html?season="+i);
        var seasonResults = {
            objectID: "Season-" + i,
            link: "https://www.tranmere-web.com/results.html?season=" + i,
            name: `Results For Season ${i}/${i+1}`
        };
        search_index.saveObject(seasonResults);
    }
    var teams = await utils.findAllTeams(200);
    var competitions = await utils.getAllCupCompetitions(50);
    var players = await utils.findAllPlayers();
    var managers = await utils.findAllTranmereManagers();
    var topScorers = await utils.getTopScorersBySeason();
    var hatTricks = await utils.findAllHatTricks();

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
        page.hatTricks = hatTricks;
        page.managers = managers;
        page.teams = teams;
        page.competitions = competitions;
        page.seasons = seasons;
        page.image = utils.buildImagePath("photos/kop.jpg", 1920,1080);

        if(page.sections) {
            var sectionContent = "";
            for(var s=0; s<page.sections.length; s++) {
                console.log(page.key);
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
        if(page.cardBlocks) {
            var blockContent = "";
            for(var b=0; b<page.cardBlocks.length; b++) {
                blockContent = blockContent + "\n" + utils.renderFragment(page.cardBlocks[b].fields, page.cardBlocks[b].sys.contentType.sys.id);
            }
            page.cardBlocksHTML = blockContent;
        }
        var fileName = page.key.toLowerCase();
        utils.buildPage(page,`./tranmere-web/templates/${page.template}`,`./tranmere-web/output/site/${fileName}.html` );
        var pageMeta = {
            objectID: "Page-" + page.key.toLowerCase(),
            link: `https://www.tranmere-web.com/${fileName}.html`,
            name: page.description,
            meta: page.name
        };
        search_index.saveObject(pageMeta);
    }

    for(var i=0; i < players.length; i++) {
        utils.addSiteMapEntry("/page/player/"+players[i].name);
        players[i].objectID = "Player-" + players[i].name;
        players[i].link = "https://www.tranmere-web.com/page/player/" + players[i].name;
        search_index.saveObject(players[i]);
    }

    for(var i=0; i< teams.length; i++) {
        teams[i].objectID = "Team-" + teams[i].name;
        teams[i].link = "https://www.tranmere-web.com/results.html?opposition=" + teams[i].name;
        teams[i].name = "Results against " +  teams[i].name;
        search_index.saveObject(teams[i]);
    }

    for(var i=0; i< competitions.length; i++) {
        competitions[i].objectID = "Competition-" + competitions[i].name;
        competitions[i].link = "https://www.tranmere-web.com/results.html?competition=" + competitions[i].name;
        competitions[i].name = "Results in " +  competitions[i].name;
        search_index.saveObject(competitions[i]);
    }

    utils.buildPage({urls:utils.pages}, "./tranmere-web/templates/sitemap.tpl.xml", './tranmere-web/output/site/sitemap.xml');
}
run().catch(console.log)