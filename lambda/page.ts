import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { TranmereWebUtils, DataTables } from '../lib/tranmere-web-utils';
import {DynamoDB} from 'aws-sdk';
import { createClient } from "contentful";
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import {IBlogPost} from '../lib/contentful'
let utils = new TranmereWebUtils();
const dynamo = new DynamoDB.DocumentClient({apiVersion: '2012-08-10'});

const client = createClient({
  space: process.env.CF_SPACE!,
  accessToken: process.env.CF_KEY!
});

exports.handler = async (event : APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> =>{

    var pageName = event.pathParameters!.pageName;
    var classifier = event.pathParameters!.classifier;
    var view : any = {};

    if(pageName === "home") {
        const blogs = await utils.getBlogs(client);
        let players = await utils.findAllPlayers();
        let random = Math.floor(Math.random() * (players.length-1));
        let randomplayer = players[random];
        var debutSearch = await dynamo.query(
            {
                TableName: DataTables.APPS_TABLE_NAME,
                KeyConditionExpression: "#name = :name",
                IndexName: "ByPlayerIndex",
                ExpressionAttributeNames:{
                    "#name": "Name"
                },
                ExpressionAttributeValues: {
                    ":name": decodeURIComponent(randomplayer.name),
                },
                Limit : 1
            }).promise();

        var apps_query = await dynamo.query({
            TableName: DataTables.SUMMARY_TABLE_NAME,
            IndexName: "ByPlayerIndex",
            KeyConditionExpression :  "Player = :player",
            ExpressionAttributeValues: {
                ":player" : randomplayer.name
            }
        }).promise();

        view = {
            title: "Home",
            pageType:"WebPage",
            description: "Tranmere-Web.com is a website full of data, statistics and information about Tranmere Rovers FC",
            blogs: blogs.items,
            randomplayer: {
                name: randomplayer.name,
                picLink: randomplayer.picLink,
                debut: debutSearch.Items![0],
                apps: apps_query.Items![0].Apps,
                goals: apps_query.Items![0].goals,
            }
        };
    } else if(pageName === "player") {
        var playerName = classifier!;
        var playerSearch = await dynamo.query(
            {
                TableName: DataTables.PLAYER_TABLE_NAME,
                KeyConditionExpression: "#name = :name",
                ExpressionAttributeNames:{
                    "#name": "name"
                },
                ExpressionAttributeValues: {
                    ":name": decodeURIComponent(playerName),
                },
                IndexName: "ByNameIndex",
                Limit : 1
            }).promise();

        var debutSearch = await dynamo.query(
            {
                TableName: DataTables.APPS_TABLE_NAME,
                KeyConditionExpression: "#name = :name",
                IndexName: "ByPlayerIndex",
                ExpressionAttributeNames:{
                    "#name": "Name"
                },
                ExpressionAttributeValues: {
                    ":name": decodeURIComponent(playerName),
                },
                Limit : 1
            }).promise();

        var summarySearch = await dynamo.query(
            {
                TableName: DataTables.SUMMARY_TABLE_NAME,
                KeyConditionExpression: "#player = :player",
                IndexName: "ByPlayerIndex",
                ExpressionAttributeNames:{
                    "#player": "Player"
                },
                ExpressionAttributeValues: {
                    ":player": decodeURIComponent(playerName),
                }
            }).promise();
        
        var transfers = await dynamo.query({
            TableName : DataTables.TRANSFER_TABLE,
            KeyConditionExpression :  "#name = :name",
            IndexName: "ByNameIndex",
            ExpressionAttributeNames:{
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name" : decodeURIComponent(playerName)
            }
        }).promise();

        var amendedTansfers : Array<any> = [];
        for(var i=0; i < transfers.Items!.length; i++) {
            var transfer = transfers.Items![i];
            transfer.club = transfer.from == "Tranmere Rovers" ? transfer.to : transfer.from;
            transfer.type = transfer.from == "Tranmere Rovers" ? "right": "left";
            amendedTansfers.push(transfer);
        }

        var links = await dynamo.query({
            TableName : DataTables.LINKS_TABLE,
            KeyConditionExpression :  "#name = :name",
            IndexName: "ByNameIndex",
            ExpressionAttributeNames:{
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name" : decodeURIComponent(playerName)
            }
        }).promise();

        var pl = playerSearch.Items!.length == 1 ? playerSearch.Items![0] : null 

        if(playerSearch.Items!.length == 0 && debutSearch.Items!.length == 0 && summarySearch.Items!.length == 0){
            throw new Error("Player has no records")
        }

        view = {
            name: decodeURIComponent(playerName),
            debut: debutSearch.Items![0],
            seasons: summarySearch.Items,
            transfers: amendedTansfers,
            links: links.Items,
            teams: await utils.findAllTeams(),
            player: pl,
            url: `/page/${pageName}/${classifier}`
        };

        view.image = utils.buildImagePath("photos/kop.jpg", 1920,1080)
        view.title = "Player Profile " + decodeURIComponent(playerName);
        view.pageType = "AboutPage";
        view.description = "Player Profile for " + decodeURIComponent(playerName);

    } else if(pageName === "tag") {
        
        var tagId = decodeURIComponent(classifier!);
        var items = await client.getEntries({'fields.tags': tagId, 'content_type': 'blogPost', order: '-sys.createdAt'});
        
        view = {
            items: items.items,
            pageType: "SearchResultsPage",
            title: "All blogs for " + tagId,
            description: "All blogs for " + tagId,
            url: `/page/${pageName}/${classifier}`,
        }
    } else if(pageName === "blog") {
        
        var blogId = decodeURIComponent(classifier!);
        var blog = await client.getEntry<IBlogPost>(blogId);
        var blogs = await utils.getBlogs(client);
        let options = {
          renderNode: {
            'embedded-asset-block': (node) =>
              `<img src="${node.data.target.fields.file.url}?h=400"/>`
          }
        }
        view = blog.fields;
        view.pageType = "AboutPage";
        view.description = "Blog Page | " + view.title;
        view.blogContent = documentToHtmlString(view.blog, options);
        view.blogs = blogs.items;
        view.url =  `/page/${pageName}/${classifier}`;
        view.carousel = [];

        if(view.gallery) {
             
            for(var i=0; i < view.gallery.length; i++) {

                var image = {
                    imagePath: view.gallery[i].fields.file.url,
                    linkPath: view.gallery[i].fields.file.url,
                    name: view.gallery[i].fields.title,
                    description: view.gallery[i].fields.description
                }
                view.carousel.push(image);
            }
            pageName = "gallery";
            delete view.gallery;
        }

        if(view.galleryTag) {    
            var pictures = await client.getAssets({'metadata.tags.sys.id[in]': view.galleryTag, order: 'sys.createdAt'});
            for(var i=0; i < pictures.items.length; i++) {
               view.carousel.push({
                imagePath: pictures.items[i].fields.file.url,
                linkPath: pictures.items[i].fields.file.url,
                name: pictures.items[i].fields.title,
                description: pictures.items[i].fields.title
            });
            }
            pageName = "gallery";
            delete view.gallery;
        }

        if(view.blocks) {
            var blockContent = "";
            for(var b=0; b < view.blocks.length; b++) {
                blockContent = blockContent + "\n" + utils.renderFragment(view.blocks[b].fields, view.blocks[b].sys.contentType.sys.id);
            }
            view.blockHTML = blockContent;
        }

        if(view.cardBlocks) {
            var blockContent = "";
            for(var b=0; b<view.cardBlocks.length; b++) {
                blockContent = blockContent + "\n" + utils.renderFragment(view.cardBlocks[b].fields, view.cardBlocks[b].sys.contentType.sys.id);
            }
            view.cardBlocksHTML = blockContent;
        }
    }
    view.random =  Math.ceil(Math.random() * 100000);
    const maxAge = pageName === "player" ? 86400 : 2592000;
    const page = utils.buildPage(view, `./templates/${pageName}.tpl.html`);
    return utils.sendHTMLResponse(page, maxAge); 
};