/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import Mustache from 'mustache';
import contentful from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import webpack from 'webpack';
import { SiteMapEntry, BaseEntity } from './tranmere-web-types';
import { TranmereWebUtils } from './tranmere-web-utils';

const utils = new TranmereWebUtils();

export class SiteBuilder {
  pages: SiteMapEntry[] = new Array<SiteMapEntry>();

  addSiteMapEntry(url: string) {
    this.pages.push(this.buildSitemapEntry(url));
  }

  pad(a: any, b: any): any {
    return (1e15 + a + '').slice(-b);
  }

  buildSitemapEntry(page: string): SiteMapEntry {
    const m = new Date();
    const dateString =
      m.getUTCFullYear() +
      '-' +
      this.pad(m.getUTCMonth() + 1, 2) +
      '-' +
      this.pad(m.getUTCDate(), 2);
    let url = page.replace(/&/g, '&amp;');
    url = page.replace('.html', '');
    return {
      url: url,
      date: dateString,
      priority: 0.5,
      changes: 'monthly'
    };
  }
  buildPageView(
    view: any,
    pageTpl: string,
    path: string,
    noindex: boolean
  ): string {
    view.url = path.replace('.html', '');
    view.random = Math.ceil(Math.random() * 100000);

    if (view.carousel) {
      for (let i = 0; i < view.carousel.length; i++) {
        const img = utils.buildImagePath(
          'screenshots/' + view.carousel[i].image,
          1000,
          400
        );
        view.carousel[i].base64 = Buffer.from(JSON.stringify(img)).toString(
          'base64'
        );
      }
    }

    const pageHTML = Mustache.render(
      fs.readFileSync(pageTpl).toString(),
      view,
      utils.loadSharedPartials()
    );
    if (!noindex) this.pages.push(this.buildSitemapEntry(view.url));

    return pageHTML;
  }

  async buildSite(
    client: contentful.ContentfulClientApi<undefined>,
    name: string,
    version: string,
    compilation: any,
    index: boolean,
    search_index: any
  ) {
    const blogs = await utils.getBlogs(client);
    const pages = await utils.getPages(client);
    const seasons = utils.getSeasons();
    const teams = await utils.findAllTeams();
    const competitions = await utils.getAllCupCompetitions();
    const players = await utils.findAllPlayers();
    const managers = await utils.findAllTranmereManagers();
    const topScorers = await utils.getTopScorersBySeason();
    const hatTricks = await utils.findAllHatTricks();

    for (let i = 0; i < pages.items.length; i++) {
      const page: any = pages.items[i].fields;
      page.blogs = blogs.items;
      const options = {
        renderNode: {
          'embedded-asset-block': (node: any) =>
            `<img src="${node.data.target.fields.file.url}"/>`
        }
      };
      page.content = documentToHtmlString(page.body!, options);
      page.topScorers = topScorers;
      page.hatTricks = hatTricks;
      page.managers = managers;
      page.teams = teams;
      page.competitions = competitions;
      page.seasons = seasons;
      page.image = utils.buildImagePath('photos/kop.jpg', 1920, 1080);
      page.dd_app = name;
      page.dd_version = version;
      page.breadcrumbs = [
        {
          link: [
            {
              link: '/',
              position: 1,
              title: 'Home'
            }
          ]
        },
        {
          active: [
            {
              position: 2,
              title: page.title
            }
          ]
        }
      ];
      if (page.sections) {
        let sectionContent = '';
        for (let s = 0; s < page.sections.length; s++) {
          sectionContent =
            sectionContent +
            '\n' +
            utils.renderFragment(page, page.sections[s]);
        }
        page.sectionHTML = sectionContent;
      }
      if (page.blocks) {
        let blockContent = '';
        for (let b = 0; b < page.blocks.length; b++) {
          blockContent =
            blockContent +
            '\n' +
            utils.renderFragment(
              page.blocks[b].fields,
              page.blocks[b].sys.contentType.sys.id
            );
        }
        page.blockHTML = blockContent;
      }
      if (page.cardBlocks) {
        let blockContent = '';
        for (let b = 0; b < page.cardBlocks.length; b++) {
          blockContent =
            blockContent +
            '\n' +
            utils.renderFragment(
              page.cardBlocks[b].fields,
              page.cardBlocks[b].sys.contentType.sys.id
            );
        }
        page.cardBlocksHTML = blockContent;
      }
      const fileName = page.key!.toLowerCase();
      const template = page.template.replace('tpl.html', 'mustache');
      compilation.emitAsset(
        `${fileName}.html`,
        new webpack.sources.RawSource(
          this.buildPageView(
            page,
            `./templates/${template}`,
            `/${fileName}.html`,
            false
          )
        )
      );
      if (index) {
        const pageMeta: BaseEntity = {
          objectID: 'Page-' + page.key!.toLowerCase(),
          link: `https://www.tranmere-web.com/${fileName}`,
          name: page.description,
          meta: page.name,
          description: 'Blog Page',
          picLink: '/assets/images/square_v1.png'
        };
        search_index.saveObject(pageMeta);
      }
    }

    for (const blog of blogs.items) {
      this.addSiteMapEntry('/page/blog/' + blog.sys.id);
    }

    if (index) {
      for (const player of players) {
        this.addSiteMapEntry('/page/player/' + encodeURIComponent(player.name));
        player.objectID = 'Player-' + player.name;
        player.link = `https://www.tranmere-web.com/page/player/${player.name}`;
        if (!player.picLink) player.picLink = '/assets/images/square_v1.png';
        player.description = 'Player Profile';
        search_index.saveObject(player);
      }

      for (const season of seasons) {
        this.addSiteMapEntry(`/games/${season}`);
        const seasonResults: BaseEntity = {
          objectID: 'Season-' + season,
          link: `https://www.tranmere-web.com/games/${season}`,
          name: `Season ${season}/${season + 1}`,
          description: 'Results Breakdown',
          picLink: '/assets/images/square_v1.png'
        };
        search_index.saveObject(seasonResults);
      }

      for (const team of teams) {
        this.addSiteMapEntry('/games/' + encodeURIComponent(team.name));
        team.objectID = 'Team-' + team.name;
        team.link = `https://www.tranmere-web.com/games/${team.name}`;
        team.picLink = '/assets/images/square_v1.png';
        team.description = 'Results Breakdown';
        search_index.saveObject(team);
      }

      for (const competition of competitions) {
        competition.objectID = 'Competition-' + competition.name;
        competition.link = `https://www.tranmere-web.com/results?competition=${competition.name}`;
        competition.picLink = '/assets/images/square_v1.png';
        competition.description = 'Results Breakdown';
        search_index.saveObject(competition);
      }

      /*
        const matches = utils.getAllGames();

        compilation.emitAsset(
          `matches-sitemap.xml`,
          new webpack.sources.RawSource(this.buildPageView({urls:matches}, "./templates/matches-sitemap.tpl.xml", `/matches-sitemap.xml`, true))
        );
        */

      compilation.emitAsset(
        `sitemap.xml`,
        new webpack.sources.RawSource(
          this.buildPageView(
            { urls: this.pages },
            './templates/sitemap.mustache',
            `/sitemap.xml`,
            true
          )
        )
      );
    }
  }
}
