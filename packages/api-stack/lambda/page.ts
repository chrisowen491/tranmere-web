/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils } from '@tranmere-web/lib/src/tranmere-web-utils';
import {
  View,
  PlayerView,
  TagView,
  SeasonResultsView,
  BlogView,
  SeasonPlayerStatisticsView,
  HomeView
} from '@tranmere-web/lib/src/tranmere-web-view-types';
import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { IBlogPost } from '@tranmere-web/lib/src/contentful';
const utils = new TranmereWebUtils();

const client = createClient({
  space: process.env.CF_SPACE!,
  accessToken: process.env.CF_KEY!
});

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  let pageName = event.pathParameters!.pageName;
  const classifier = event.pathParameters!.classifier;
  let view: View = {};

  if (pageName === 'home') {
    const blogs = await utils.getBlogs(client);
    const homeview: HomeView = {
      title: 'Home',
      pageType: 'WebPage',
      description:
        'Tranmere-Web.com is a website full of data, statistics and information about Tranmere Rovers FC',
      blogs: blogs.items,
      breadcrumbs: [utils.getActiveBreadcrumb('Home', 1)],
      randomplayer: await utils.getRandomPlayer()
    };

    view = homeview;
  } else if (pageName === 'player') {
    const playerName = classifier!;
    const player = await utils.getPlayer(playerName);

    const summarySearch = await utils.getPlayerSummary(playerName);

    const transfers = await utils.getPlayerTransfers(playerName);

    const appearances = await utils.getAppsByPlayer(
      decodeURIComponent(playerName)
    );

    const amendedTansfers: any[] = [];
    for (const transfer of transfers!) {
      transfer.club =
        transfer.from == 'Tranmere Rovers' ? transfer.to : transfer.from;
      transfer.type = transfer.from == 'Tranmere Rovers' ? 'right' : 'left';
      amendedTansfers.push(transfer);
    }

    const links = await utils.getPlayerLinks(playerName);

    if (!player) {
      throw new Error('Player has no records');
    }

    const playerview: PlayerView = {
      debut: appearances[0],
      seasons: summarySearch,
      transfers: amendedTansfers,
      links: links,
      image: utils.buildImagePath('photos/kop.jpg', 1920, 1080),
      title: 'Player Profile ' + decodeURIComponent(playerName),
      pageType: 'AboutPage',
      description: 'Player Profile for ' + decodeURIComponent(playerName),
      teams: await utils.findAllTeams(),
      player: player,
      breadcrumbs: [
        utils.getHomeBreadCrumb(),
        {
          link: [
            {
              link: '/playersearch',
              position: 2,
              title: 'Players'
            }
          ]
        },
        utils.getActiveBreadcrumb(playerName, 3)
      ],
      appearances: appearances,
      url: `/page/${pageName}/${classifier}`
    };

    view = playerview;
  } else if (pageName === 'tag') {
    const tagId = decodeURIComponent(classifier!);
    const items = await client.getEntries({
      'fields.tags': tagId,
      content_type: 'blogPost',
      order: ['-sys.createdAt']
    });

    const tagview: TagView = {
      items: items.items,
      pageType: 'SearchResultsPage',
      title: 'All blogs for ' + tagId,
      description: 'All blogs for ' + tagId,
      url: `/page/${pageName}/${classifier}`,
      breadcrumbs: [
        utils.getHomeBreadCrumb(),
        utils.getActiveBreadcrumb(tagId, 2)
      ]
    };

    view = tagview;
  } else if (pageName === 'blog') {
    const blogId = decodeURIComponent(classifier!);
    const blog = await client.getEntry<IBlogPost>(blogId);
    const blogs = await utils.getBlogs(client);
    const options = {
      renderNode: {
        'embedded-asset-block': (node) =>
          `<img src="${node.data.target.fields.file.url}?h=400"/>`
      }
    };

    const blogview = blog.fields as BlogView;

    blogview.pageType = 'blogPost';
    blogview.headline = blogview.title;
    blogview.blogContent = documentToHtmlString(blogview.blog!, options);
    blogview.blogs = blogs.items;
    blogview.url = `/page/${pageName}/${classifier}`;
    blogview.carousel = [];
    blogview.breadcrumbs = [
      utils.getHomeBreadCrumb(),
      utils.getActiveBreadcrumb(view.title!, 2)
    ];

    if (blogview.gallery) {
      blogview.gallery.forEach((gallery) => {
        blogview.carousel!.push({
          imagePath: `${gallery.fields.file!.url}`,
          linkPath: `${gallery.fields.file!.url}`,
          name: `${gallery.fields.title}`,
          description: `${gallery.fields.description}`
        });
      });
      pageName = 'gallery';
      delete blogview.gallery;
    }

    if (blogview.galleryTag) {
      const pictures = await client.getAssets({
        'metadata.tags.sys.id[in]': [blogview.galleryTag],
        order: ['sys.createdAt']
      });
      pictures.items.forEach((picture) => {
        blogview.carousel!.push({
          imagePath: `${picture.fields.file!.url}`,
          linkPath: `${picture.fields.file!.url}`,
          name: `${picture.fields.title}`,
          description: `${picture.fields.description}`
        });
      });
      pageName = 'gallery';
      delete blogview.gallery;
    }

    if (blogview.blocks) {
      let blockContent = '';
      for (const block of blogview.blocks) {
        blockContent =
          blockContent +
          '\n' +
          utils.renderFragment(block.fields, block.sys.contentType.sys.id);
      }
      blogview.blockHTML = blockContent;
    }

    if (blogview.cardBlocks) {
      let blockContent = '';
      for (const block of blogview.cardBlocks) {
        blockContent =
          blockContent +
          '\n' +
          utils.renderFragment(block.fields, block.sys.contentType.sys.id);
      }
      blogview.cardBlocksHTML = blockContent;
    }

    view = blogview;
  } else if (pageName === 'player-records') {
    pageName = 'player-search';
    const seasons = utils.getSeasons();
    let season: string | null = null;
    let filter: string | null = null;
    let sort = 'Date';
    let title = `Season Player Records - ${classifier}`;
    let description = `Tranmere Rovers FC Player Records For Season ${classifier}`;

    if (utils.isNumeric(classifier!)) {
      season = classifier!;
    } else if (classifier === 'top-scorers') {
      title = `Tranmere Record Goalscorers`;
      description = `Tranmere Rovers FC Top Scorers Since 1977`;
      sort = 'Goals';
    } else if (classifier === 'most-appearances') {
      title = `Tranmere Record Appearances`;
      description = `Tranmere Rovers FC Top Appearances Since 1977`;
      sort = 'Starts';
    } else if (classifier === 'only-one-appearance') {
      title = `Only Played Once For Tranmere `;
      description = `Tranmere Rovers FC Players Who Only Played Once Since 1977`;
      filter = 'OnlyOneApp';
    }

    const results = await utils.getPlayers(season!, filter!, sort);

    const playerview: SeasonPlayerStatisticsView = {
      title: title,
      pageType: 'WebPage',
      url: `/player-records/${classifier}`,
      seasons: seasons,
      season: season,
      sort: sort,
      filter: filter,
      players: results,
      description: description,
      breadcrumbs: [
        utils.getHomeBreadCrumb(),
        {
          link: [
            {
              link: '/playersearch',
              position: 2,
              title: 'Players'
            }
          ]
        },
        utils.getActiveBreadcrumb(classifier!, 3)
      ]
    };

    view = playerview;
  } else if (pageName === 'games') {
    pageName = 'results-home';
    const seasons = utils.getSeasons();
    const teams = await utils.findAllTeams();
    const competitions = await utils.getAllCupCompetitions();
    const managers = await utils.findAllTranmereManagers();

    let season: string | null = null;
    let opposition: string | null = null;
    let venue: string | null = null;
    let sort = 'Date';
    let pens: string | null = null;
    let title = `Results - ${classifier}`;
    let description = `Tranmere Rovers FC Results For Season ${classifier}`;

    if (utils.isNumeric(classifier!)) {
      season = classifier!;
    } else if (classifier === 'at-wembley') {
      title = `Results At Wembley`;
      description = `Tranmere Rovers FC Results At Wembley Stadium`;
      venue = 'Wembley Stadium';
    } else if (classifier === 'penalty-shootouts') {
      title = `Results - Penalty Shootouts`;
      description = `Tranmere Rovers FC Results In Penalty Shootouts`;
      pens = 'Penalty Shootout';
    } else if (classifier === 'top-attendances') {
      title = `Top Attendences`;
      description = `Tranmere Rovers FC Results Top Attendences`;
      sort = 'Top Attendance';
      sort = 'Top Attendance';
    } else if (classifier === 'top-home-attendances') {
      title = `Top Home Attendences`;
      description = `Tranmere Rovers FC Results Top Attendences At Home Prenton Park`;
      sort = 'Top Attendance';
      venue = 'Prenton Park';
    } else {
      title = `Results vs ${decodeURIComponent(classifier!)}`;
      description = `Tranmere Rovers FC Results against ${decodeURIComponent(classifier!)}`;
      opposition = decodeURIComponent(classifier!);
    }

    const results = await utils.getResults(
      season!,
      opposition!,
      venue!,
      sort,
      pens!
    );

    const resultsView: SeasonResultsView = {
      title: title,
      pageType: 'WebPage',
      url: `/results/${classifier}`,
      teams: teams,
      competitions: competitions,
      opposition: opposition,
      sort: sort,
      venue: venue,
      season: season,
      pens: pens,
      managers: managers,
      seasons: seasons,
      results: results.results,
      h2hresults: results.h2hresults,
      h2htotal: results.h2htotal,
      description: description,
      breadcrumbs: [
        utils.getHomeBreadCrumb(),
        {
          link: [
            {
              link: '/results',
              position: 2,
              title: 'Results'
            }
          ]
        },
        utils.getActiveBreadcrumb(title!, 3)
      ]
    };

    view = resultsView;
  }

  view.random = Math.ceil(Math.random() * 100000);
  const maxAge = pageName === 'player' ? 86400 : 2592000;
  const page = utils.buildPage(view, `./templates/${pageName}.mustache`);
  return utils.sendHTMLResponse(page, maxAge);
};
