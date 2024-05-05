/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { createClient } from 'contentful';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { IBlogPost } from '../lib/contentful';
const utils = new TranmereWebUtils();
const dynamo = DynamoDBDocument.from(
  new DynamoDB({ apiVersion: '2012-08-10' })
);

const client = createClient({
  space: process.env.CF_SPACE!,
  accessToken: process.env.CF_KEY!
});

exports.handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  let pageName = event.pathParameters!.pageName;
  const classifier = event.pathParameters!.classifier;
  let view: any = {};

  if (pageName === 'home') {
    const blogs = await utils.getBlogs(client);
    const players = await utils.findAllPlayers();
    const random = Math.floor(Math.random() * (players.length - 1));
    const randomplayer = players[random];

    const debutSearch = await dynamo.query({
      TableName: DataTables.APPS_TABLE_NAME,
      KeyConditionExpression: '#name = :name',
      IndexName: 'ByPlayerIndex',
      ExpressionAttributeNames: {
        '#name': 'Name'
      },
      ExpressionAttributeValues: {
        ':name': decodeURIComponent(randomplayer.name)
      },
      Limit: 1
    });

    const apps_query = await dynamo.query({
      TableName: DataTables.SUMMARY_TABLE_NAME,
      IndexName: 'ByPlayerIndex',
      KeyConditionExpression: 'Player = :player and Season = :season',
      ExpressionAttributeValues: {
        ':player': randomplayer.name,
        ':season': 'TOTAL'
      }
    });
    const seasonMapping = {
      '1978': 1977,
      '1984': 1983,
      '1990': 1989,
      '1992': 1991,
      '1994': 1993,
      '1996': 1995,
      '1998': 1997,
      '2001': 2000,
      '2003': 2002,
      '2005': 2006,
      '2008': 2007
    };
    const re = /\/\d\d\d\d\//gm;
    const re3 = /\/\d\d\d\d[A-Za-z]\//gm;
    let season = debutSearch.Items![0].Season;
    if (seasonMapping[season]) season = seasonMapping[season];

    randomplayer.picLink = randomplayer.picLink!.replace(
      re,
      '/' + season + '/'
    );
    randomplayer.picLink = randomplayer.picLink!.replace(
      re3,
      '/' + season + '/'
    );

    view = {
      title: 'Home',
      pageType: 'WebPage',
      description:
        'Tranmere-Web.com is a website full of data, statistics and information about Tranmere Rovers FC',
      blogs: blogs.items,
      randomplayer: {
        name: randomplayer.name,
        picLink: randomplayer.picLink,
        debut: debutSearch.Items![0],
        apps: apps_query.Items![0].Apps,
        goals: apps_query.Items![0].goals
      }
    };
  } else if (pageName === 'player') {
    const playerName = classifier!;
    const playerSearch = await dynamo.query({
      TableName: DataTables.PLAYER_TABLE_NAME,
      KeyConditionExpression: '#name = :name',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': decodeURIComponent(playerName)
      },
      IndexName: 'ByNameIndex',
      Limit: 1
    });

    const summarySearch = await dynamo.query({
      TableName: DataTables.SUMMARY_TABLE_NAME,
      KeyConditionExpression: '#player = :player',
      IndexName: 'ByPlayerIndex',
      ExpressionAttributeNames: {
        '#player': 'Player'
      },
      ExpressionAttributeValues: {
        ':player': decodeURIComponent(playerName)
      }
    });

    const transfers = await dynamo.query({
      TableName: DataTables.TRANSFER_TABLE,
      KeyConditionExpression: '#name = :name',
      IndexName: 'ByNameIndex',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': decodeURIComponent(playerName)
      }
    });

    const appearances = await utils.getAppsByPlayer(
      decodeURIComponent(playerName)
    );

    const amendedTansfers: any[] = [];
    for (const transfer of transfers.Items!) {
      transfer.club =
        transfer.from == 'Tranmere Rovers' ? transfer.to : transfer.from;
      transfer.type = transfer.from == 'Tranmere Rovers' ? 'right' : 'left';
      amendedTansfers.push(transfer);
    }

    const links = await dynamo.query({
      TableName: DataTables.LINKS_TABLE,
      KeyConditionExpression: '#name = :name',
      IndexName: 'ByNameIndex',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': decodeURIComponent(playerName)
      }
    });

    const pl = playerSearch.Items!.length == 1 ? playerSearch.Items![0] : null;

    if (playerSearch.Items!.length == 0 && summarySearch.Items!.length == 0) {
      throw new Error('Player has no records');
    }

    view = {
      name: decodeURIComponent(playerName),
      debut: appearances[0],
      seasons: summarySearch.Items,
      transfers: amendedTansfers,
      links: links.Items,
      teams: await utils.findAllTeams(),
      player: pl,
      appearances: appearances,
      url: `/page/${pageName}/${classifier}`
    };

    view.image = utils.buildImagePath('photos/kop.jpg', 1920, 1080);
    view.title = 'Player Profile ' + decodeURIComponent(playerName);
    view.pageType = 'AboutPage';
    view.description = 'Player Profile for ' + decodeURIComponent(playerName);
  } else if (pageName === 'tag') {
    const tagId = decodeURIComponent(classifier!);
    const items = await client.getEntries({
      'fields.tags': tagId,
      content_type: 'blogPost',
      order: ['-sys.createdAt']
    });

    view = {
      items: items.items,
      pageType: 'SearchResultsPage',
      title: 'All blogs for ' + tagId,
      description: 'All blogs for ' + tagId,
      url: `/page/${pageName}/${classifier}`
    };
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
    view = blog.fields;
    view.pageType = 'AboutPage';
    view.description = 'Blog Page | ' + view.title;
    view.blogContent = documentToHtmlString(view.blog, options);
    view.blogs = blogs.items;
    view.url = `/page/${pageName}/${classifier}`;
    view.carousel = [];

    if (view.gallery) {
      view.gallery.forEach((gallery) => {
        const image = {
          imagePath: gallery.fields.file.url,
          linkPath: gallery.fields.file.url,
          name: gallery.fields.title,
          description: gallery.fields.description
        };
        view.carousel.push(image);
      });
      pageName = 'gallery';
      delete view.gallery;
    }

    if (view.galleryTag) {
      const pictures = await client.getAssets({
        'metadata.tags.sys.id[in]': view.galleryTag,
        order: ['sys.createdAt']
      });
      pictures.items.forEach((picture) => {
        view.carousel.push({
          imagePath: picture.fields.file!.url,
          linkPath: picture.fields.file!.url,
          name: picture.fields.title,
          description: picture.fields.title
        });
      });
      pageName = 'gallery';
      delete view.gallery;
    }

    if (view.blocks) {
      let blockContent = '';
      for (const block of view.blocks) {
        blockContent =
          blockContent +
          '\n' +
          utils.renderFragment(block.fields, block.sys.contentType.sys.id);
      }
      view.blockHTML = blockContent;
    }

    if (view.cardBlocks) {
      let blockContent = '';
      for (const block of view.cardBlock) {
        blockContent =
          blockContent +
          '\n' +
          utils.renderFragment(block.fields, block.sys.contentType.sys.id);
      }
      view.cardBlocksHTML = blockContent;
    }
  } else if (pageName === 'games') {
    pageName = 'results-home';
    const seasons = utils.getSeasons();
    const teams = await utils.findAllTeams();
    const competitions = await utils.getAllCupCompetitions();
    const managers = await utils.findAllTranmereManagers();
    view = {
      title: `Results - ${classifier}`,
      pageType: 'WebPage',
      url: `/results/${classifier}`,
      teams: teams,
      competitions: competitions,
      managers: managers,
      seasons: seasons,
      description: `Tranmere Rovers FC Results For Season ${classifier}`
    };

    let season = '';
    let opposition = '';
    let venue = '';
    let sort = 'Date';
    let pens = '';

    if (utils.isNumeric(classifier!)) {
      view.season = classifier;
      season = classifier!;
    } else if (classifier === 'at-wembley') {
      view.title = `Results At Wembley`;
      view.description = `Tranmere Rovers FC Results At Wembley Stadium`;
      view.venue = 'Wembley Stadium';
      venue = 'Wembley Stadium';
    } else if (classifier === 'penalty-shootouts') {
      view.title = `Results - Penalty Shootouts`;
      view.description = `Tranmere Rovers FC Results In Penalty Shootouts`;
      view.pens = 'Penalty Shootout';
      pens = 'Penalty Shootout';
      view.results = await utils.getResults(
        '',
        '',
        '',
        'Date',
        'Penalty Shootout'
      );
    } else if (classifier === 'top-attendances') {
      view.title = `Top Attendences`;
      view.description = `Tranmere Rovers FC Results Top Attendences`;
      view.sort = 'Top Attendance';
      sort = 'Top Attendance';
    } else if (classifier === 'top-home-attendances') {
      view.title = `Top Home Attendences`;
      view.description = `Tranmere Rovers FC Results Top Attendences At Home Prenton Park`;
      view.sort = 'Top Attendance';
      view.venue = 'Prenton Park';
      sort = 'Top Attendance';
      venue = 'Prenton Park';
    } else {
      view.title = `Results vs ${decodeURIComponent(classifier!)}`;
      view.description = `Tranmere Rovers FC Results against ${decodeURIComponent(classifier!)}`;
      view.opposition = decodeURIComponent(classifier!);
      opposition = decodeURIComponent(classifier!);
    }

    const results = await utils.getResults(
      season,
      opposition,
      venue,
      sort,
      pens
    );
    view.results = results.results;
    view.h2hresults = results.h2hresults;
    view.h2htotal = results.h2htotal;
  }
  view.random = Math.ceil(Math.random() * 100000);
  const maxAge = pageName === 'player' ? 86400 : 2592000;
  const page = utils.buildPage(view, `./templates/${pageName}.mustache`);
  return utils.sendHTMLResponse(page, maxAge);
};
