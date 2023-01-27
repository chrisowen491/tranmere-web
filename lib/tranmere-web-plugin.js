const contentful = require("contentful");
const contentfulSDK = require('@contentful/rich-text-html-renderer');
const algoliasearch = require('algoliasearch');
const chalk = require('chalk');
const utils = require('./utils')();
const pack = require('../package.json');

const client = contentful.createClient({
  space: process.env.CF_SPACE,
  accessToken: process.env.CF_KEY
});
const search_client = algoliasearch(process.env.AL_SPACE, process.env.AL_KEY);
const search_index = search_client.initIndex(process.env.AL_INDEX);

class TranmereWebPlugin {
    
  constructor(options = {}) {
    this.options = { ...options };
  }
  
  apply(compiler) {

    const pluginName = 'Tranmere Web Plugin';
    const { webpack } = compiler;
    const { Compilation } = webpack;
    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapPromise(
        {
          name: pluginName,

          // Using one of the later asset processing stages to ensure
          // that all assets were already added to the compilation by other plugins.
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        async (assets) => {
          
          
          compilation.fileDependencies.add("./package.json");

          var content = await client.getEntries({'content_type': 'blogPost', order: '-fields.datePosted'});
          var pages = await client.getEntries({'content_type': 'pageMetaData'});
          var seasons = utils.getSeasons();
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
            page.dd_app = pack.name;
            page.dd_version = pack.version;
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
            if(page.cardBlocks) {
                var blockContent = "";
                for(var b=0; b<page.cardBlocks.length; b++) {
                    blockContent = blockContent + "\n" + utils.renderFragment(page.cardBlocks[b].fields, page.cardBlocks[b].sys.contentType.sys.id);
                }
                page.cardBlocksHTML = blockContent;
            }
            var fileName = page.key.toLowerCase();
            compilation.emitAsset(
              `${fileName}.html`,
              new RawSource(utils.buildPageView(page,`./templates/${page.template}`, `/${fileName}.html`))
            );
            console.log(chalk.green.bold(`Building ${fileName}.html`));
            if(this.options.index) {
              var pageMeta = {
                objectID: "Page-" + page.key.toLowerCase(),
                link: `https://www.tranmere-web.com/${fileName}.html`,
                name: page.description,
                meta: page.name,
                description: "Blog Page",
                picLink: "/assets/images/square_v1.png"
              };
              search_index.saveObject(pageMeta);
            }
          }
      
          if(this.options.index) {
            for(var i = 0; i < seasons.length; i++) {
              utils.addSiteMapEntry("/results.html?season="+seasons[i]);
              var seasonResults = {
                  objectID: "Season-" + seasons[i],
                  link: "https://www.tranmere-web.com/results.html?season=" + seasons[i],
                  name: `Season ${seasons[i]}/${seasons[i]+1}`,
                  description: "Results Breakdown",
                  picLink: "/assets/images/square_v1.png"
              };
              search_index.saveObject(seasonResults);
            }

            for(var i=0; i < players.length; i++) {
              utils.addSiteMapEntry("/page/player/"+players[i].name);
              players[i].objectID = "Player-" + players[i].name;
              players[i].link = "https://www.tranmere-web.com/page/player/" + players[i].name;
              if(!players[i].picLink)
                  players[i].picLink = "/assets/images/square_v1.png"
              players[i].description = "Player Profile";    
              search_index.saveObject(players[i]);
            }

            for(var i=0; i< teams.length; i++) {
                teams[i].objectID = "Team-" + teams[i].name;
                teams[i].link = "https://www.tranmere-web.com/results.html?opposition=" + teams[i].name;
                teams[i].name = teams[i].name;
                teams[i].picLink = "/assets/images/square_v1.png";
                teams[i].description = "Results Breakdown";   
                search_index.saveObject(teams[i]);
            }
        
            for(var i=0; i< competitions.length; i++) {
                competitions[i].objectID = "Competition-" + competitions[i].name;
                competitions[i].link = "https://www.tranmere-web.com/results.html?competition=" + competitions[i].name;
                competitions[i].name = competitions[i].name;
                competitions[i].picLink = "/assets/images/square_v1.png";
                competitions[i].description = "Results Breakdown"; 
                search_index.saveObject(competitions[i]);
            }       
            compilation.emitAsset(
              `sitemap.xml`,
              new RawSource(utils.buildPageView({urls:utils.pages}, "./templates/sitemap.tpl.xml", `/sitemap.xml`, true))
            );
          }
        }
      );
    });
  }
}  
module.exports = TranmereWebPlugin;