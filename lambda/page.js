const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();
const utils = require('../lib/utils')();
const contentful = require("contentful");
const contentfulSDK = require('@contentful/rich-text-html-renderer');

const client = contentful.createClient({
  space: process.env.CF_SPACE,
  accessToken: process.env.CF_KEY
});

exports.handler = async function (event, context) {
    var pageName = event.pathParameters.pageName;
    var classifier = event.pathParameters.classifier;
    var view = {
        random: Math.ceil(Math.random() * 100000)
    }

    if(pageName === "home") {
        const content = await client.getEntries({'content_type': 'blogPost', order: '-sys.createdAt'});
        view = {
            title: "Home",
            pageType:"WebPage",
            description: "Tranmere-Web.com is a website full of data, statistics and information about Tranmere Rovers FC",
            blogs: content.items
        };
    } else if(pageName === "player") {
        var playerName = classifier;
        var playerSearch = await dynamo.query(
            {
                TableName: utils.PLAYER_TABLE_NAME,
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
                TableName: utils.APPS_TABLE_NAME,
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
                TableName: utils.SUMMARY_TABLE_NAME,
                KeyConditionExpression: "#player = :player",
                IndexName: "ByPlayerIndex",
                ExpressionAttributeNames:{
                    "#player": "Player"
                },
                ExpressionAttributeValues: {
                    ":player": decodeURIComponent(playerName),
                }
            }).promise();
        
        var pl = playerSearch.Items.length == 1 ? playerSearch.Items[0] : null 

        if(playerSearch.Items.length == 0 && debutSearch.Items.length == 0 && summarySearch.Items.length == 0){
            throw new Error("Player has no records")
        }

        view = {
            name: decodeURIComponent(playerName),
            debut: debutSearch.Items[0],
            seasons: summarySearch.Items,
            player: pl,
            url: `/page/${pageName}/${classifier}`
        };

        view.image = utils.buildImagePath("photos/kop.jpg", 1920,1080)
        view.title = "Player Profile " + decodeURIComponent(playerName);
        view.pageType = "AboutPage";
        view.description = "Player Profile for " + decodeURIComponent(playerName);

    } else if(pageName === "tag") {
        
        var tagId = decodeURIComponent(classifier);
        var items = await client.getEntries({'fields.tags': tagId, 'content_type': 'blogPost', order: '-sys.createdAt'});

        view = {
            items: items.items,
            pageType: "SearchResultsPage",
            title: "All blogs for " + tagId,
            description: "All blogs for " + tagId,
            url: `/page/${pageName}/${classifier}`,
        }
    } else if(pageName === "blog") {
        
        var blogId = decodeURIComponent(classifier);
        var content = await client.getEntry(blogId);
        var blogs = await client.getEntries({'content_type': 'blogPost', order: '-sys.createdAt'});
        let options = {
          renderNode: {
            'embedded-asset-block': (node) =>
              `<img src="${node.data.target.fields.file.url}?h=400"/>`
          }
        }
        view = content.fields;
        view.pageType = "AboutPage";
        view.description = "Blog Page | " + content.fields.title;
        view.blogContent = contentfulSDK.documentToHtmlString(content.fields.blog, options);
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
               var image = {
                   imagePath: pictures.items[i].fields.file.url,
                   linkPath: pictures.items[i].fields.file.url,
                   name: pictures.items[i].fields.title,
                   description: pictures.items[i].fields.title
               }
               view.carousel.push(image);
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

    const maxAge = pageName === "player" ? 86400 : 2592000;
    const page = utils.buildPage(view, `./templates/${pageName}.tpl.html`);
    return utils.sendHTMLResponse(page, maxAge); 
};
