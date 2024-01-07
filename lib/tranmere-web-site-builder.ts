import fs from 'fs';
import Mustache from 'mustache';
import contentful from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import webpack from 'webpack';
import { SiteMapEntry, BaseEntity } from './tranmere-web-types'
import { TranmereWebUtils } from './tranmere-web-utils';

const utils = new TranmereWebUtils();

export class SiteBuilder  {

    pages: Array<SiteMapEntry> = new Array<SiteMapEntry>();

    addSiteMapEntry(url: string ) {
      this.pages.push(this.buildSitemapEntry(url));
    }
    
    pad(a: any,b: any): any{
      return(1e15+a+"").slice(-b)
    }

    buildSitemapEntry(page: string) : SiteMapEntry {
      var m = new Date();
      var dateString = m.getUTCFullYear() +"-"+ this.pad(m.getUTCMonth()+1,2) +"-"+this.pad(m.getUTCDate(),2);
      return {
          url: page.replace(/&/g, '&amp;'),
          date: dateString,
          priority: 0.5,
          changes: "monthly"
      };
    };
    buildPageView (view: any, pageTpl: string, path: string, noindex: boolean) : string {
      view.url = path;
      view.random = Math.ceil(Math.random() * 100000);

      if(view.carousel) {
          for(var i=0; i < view.carousel.length; i++) {
          var img = utils.buildImagePath("screenshots/" + view.carousel[i].image, 1000, 400)
          view.carousel[i].base64 = Buffer.from(JSON.stringify(img)).toString('base64');
        }
      }

      var pageHTML = Mustache.render(fs.readFileSync(pageTpl).toString(), view, utils.loadSharedPartials());
      if(!noindex)
          this.pages.push(this.buildSitemapEntry(view.url));

      return pageHTML;
    }

    async buildSite(client: contentful.ContentfulClientApi<undefined>, name: string, 
      version: string, compilation: any, index: boolean, search_index: any) {

      let blogs = await utils.getBlogs(client);
      let pages = await utils.getPages(client); 
      let seasons = utils.getSeasons();
      let teams = await utils.findAllTeams();
      let competitions = await utils.getAllCupCompetitions();
      let players = await utils.findAllPlayers();
      let managers = await utils.findAllTranmereManagers();
      let topScorers = await utils.getTopScorersBySeason();
      let hatTricks = await utils.findAllHatTricks(20);

      for(var i=0; i < pages.items.length; i++) {

        let page : any = pages.items[i].fields;
        page.blogs = blogs.items;
        let options = {
          renderNode: {
            'embedded-asset-block': (node: any) =>
              `<img src="${node.data.target.fields.file.url}"/>`
          }
        }
        page.content =  documentToHtmlString(page.body!, options);
        page.topScorers = topScorers;
        page.hatTricks = hatTricks;
        page.managers = managers;
        page.players = players;
        page.teams = teams;
        page.competitions = competitions;
        page.seasons = seasons;
        page.image = utils.buildImagePath("photos/kop.jpg", 1920,1080);
        page.dd_app = name;
        page.dd_version = version;
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
        var fileName = page.key!.toLowerCase();
        compilation.emitAsset(
          `${fileName}.html`,
          new webpack.sources.RawSource(this.buildPageView(page,`./templates/${page.template}`, `/${fileName}.html`, false))
        );
        if(index) {
          var pageMeta : BaseEntity = {
            objectID: "Page-" + page.key!.toLowerCase(),
            link: `https://www.tranmere-web.com/${fileName}.html`,
            name: page.description,
            meta: page.name,
            description: "Blog Page",
            picLink: "/assets/images/square_v1.png"
          };
          search_index.saveObject(pageMeta);
        }
      }
  
      if(index) {
        for(var i = 0; i < seasons.length; i++) {
          this.addSiteMapEntry("/results.html?season="+seasons[i]);
          var seasonResults: BaseEntity = {
              objectID: "Season-" + seasons[i],
              link: "https://www.tranmere-web.com/results.html?season=" + seasons[i],
              name: `Season ${seasons[i]}/${seasons[i]+1}`,
              description: "Results Breakdown",
              picLink: "/assets/images/square_v1.png"
          };
          search_index.saveObject(seasonResults);
        }

        for(var i=0; i < players.length; i++) {
          this.addSiteMapEntry("/page/player/"+players[i].name);
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
          new webpack.sources.RawSource(this.buildPageView({urls:this.pages}, "./templates/sitemap.tpl.xml", `/sitemap.xml`, true))
        );       
      }
    }
}