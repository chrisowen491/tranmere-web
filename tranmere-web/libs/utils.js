module.exports = function (path, fs, Mustache, axios, key, appsynckey) {
    return {
         
         APP_SYNC_URL: "https://jafvqela5jaz3or4rxu3yo4xry.appsync-api.eu-west-1.amazonaws.com",
      
         APP_SYNC_OPTIONS: {
          headers: {
            'x-api-key': appsynckey
          }
         },

         apiOptions: {
           headers: {
             'x-api-key': key
           }
         },
         pages: [],

         pad: function(a,b){
            return(1e15+a+"").slice(-b)
         },

         buildSitemapEntry: function(page) {
            var m = new Date();
            var dateString = m.getUTCFullYear() +"-"+ this.pad(m.getUTCMonth()+1,2) +"-"+this.pad(m.getUTCDate(),2);

            return {
                url: page.replace('&', '&amp;'),
                date: dateString,
                priority: 0.5,
                changes: "monthly"
            };
         },

         loadSharedPartials: function() {
           var partials = {};

           var files = fs.readdirSync('./tranmere-web/templates/partials');
           for (var i = 0, l = files.length; i < l; i++) {
             var file = files[i];

             if (file.match(/\.partial\.mustache$/)) {
               var name = path.basename(file, '.partial.mustache');
               partials[name] = fs.readFileSync('./tranmere-web/templates/partials/' + file, {
                 encoding: 'utf8'
               });
             }
           }
           return partials;
         },

         buildImagePath: function (image, width, height) {
            var body = {
             "bucket": "trfc-programmes",
             "key": image,
               "edits": {
                 "resize": {
                   "width": width,
                   "height": height,
                   "fit": "fill",
                 }
               }
             };
            return "https://images.tranmere-web.com/" + Buffer.from(JSON.stringify(body)).toString('base64');
         },

         addSiteMapEntry: function(url) {
            this.pages.push(this.buildSitemapEntry(url));
         },

         buildPage: function (view, pageTpl, outputPath, noindex) {
            console.log("Building " + outputPath);
            if(outputPath != './tranmere-web/output/site/index.html')
                view.url = outputPath.replace('./tranmere-web/output/site/','/');

            if(outputPath == './tranmere-web/output/site/index.html') {
                view.url = "";
            }
            view.random = Math.ceil(Math.random() * 100000);

            if(view.carousel) {
                for(var i=0; i < view.carousel.length; i++) {
                    var body = {
                        "bucket": "trfc-programmes",
                        "key": "screenshots/" + view.carousel[i].image,
                          "edits": {
                            "resize": {
                              "width": 1000,
                              "height": 400,
                              "fit": "contain",
                              "background": {
                                "r": 255,
                                "g": 255,
                                "b": 255,
                                "alpha": 1
                              }
                            }
                          }
                        };
                    view.carousel[i].base64 = Buffer.from(JSON.stringify(body)).toString('base64');
                }
            }

            var pageHTML = Mustache.render(fs.readFileSync(pageTpl).toString(), view, this.loadSharedPartials());
            if(!noindex)
                this.pages.push(this.buildSitemapEntry(view.url));
            fs.writeFile(outputPath, pageHTML, function (err) {
                if (err) return console.log(err);
            });
         },

         renderFragment : function(view, templateKey) {
            if(view.chart) {
                view.chart = JSON.stringify(view.chart);
            }
            var tpl = `./tranmere-web/templates/partials/${templateKey}.partial.mustache`;
            return Mustache.render(fs.readFileSync(tpl).toString(), view, this.loadSharedPartials());
         },

         // Done
         findAllPlayers : async function() {
            var results = await axios.get(`${this.APP_SYNC_URL}/graphql?query={listTranmereWebPlayerTable(limit:300){items{name}}}`, this.APP_SYNC_OPTIONS);
            var players = [];
            for(var i=0; i < results.data.data.listTranmereWebPlayerTable.items.length; i++) {
                var player = results.data.data.listTranmereWebPlayerTable.items[i];
                players.push(player);
            }
            return players;
         },

         // Done
         findAllTranmereManagers : async function() {
            var results = await axios.get(`${this.APP_SYNC_URL}/graphql?query={listTranmereWebManagers(limit:300){items{name%20dateLeft%20dateJoined}}}`, this.APP_SYNC_OPTIONS);

            var managers = [];
            for(var i=0; i < results.data.data.listTranmereWebManagers.items.length; i++) {
                var manager = results.data.data.listTranmereWebManagers.items[i];
                var dateLeft = "now";
                if(manager.dateLeft)
                    dateLeft = manager.dateLeft;
                manager.dateLeftText = dateLeft;
                managers.push(manager)
            }
             managers.sort(function(a, b) {
               if (a.dateJoined < b.dateJoined) return 1
               if (a.dateJoined > b.dateJoined) return -1
               return 0
             });
            return managers;
         },

         // Done
         getAllCupCompetitions : async function(size) {
            var results = await axios.get(`${this.APP_SYNC_URL}/graphql?query={listTranmereWebCompetitions(limit:500){items{name}}}`, this.APP_SYNC_OPTIONS);
            return results.data.data.listTranmereWebCompetitions.items;
        },

         // done
         getTopScorersBySeason : async function() {

            var results = [];
            var theDate = new Date();
            var theYear = theDate.getUTCMonth() > 6 ? theDate.getFullYear() : theDate.getFullYear() -1;
        
            for(var i= 1977; i <= theYear; i++) {
                var result = await axios.get("https://api.ci1.tranmere-web.com/player-search/?season="+i+"&sort=Goals", this.apiOptions);
                var player = result.data.players[0];
                if(player)
                  results.push(player);
            }
            return results;
         },

         // Done
         findAllTeams : async function(size) {
            var result = await axios.get(`${this.APP_SYNC_URL}/graphql?query={listTranmereWebClubs(limit:500){items{name}}}`, this.APP_SYNC_OPTIONS);
            var results = result.data.data.listTranmereWebClubs.items;

            results.sort(function(a, b) {
              if (a.name < b.name) return -1;
              if (a.name > b.name) return 1;
              return 0;
            });
            return results;
         },

         // Done
         findAllHatTricks : async function(size) {
            var result = await axios.get(`${this.APP_SYNC_URL}/graphql?query={listTranmereWebHatTricks(limit:500){items{Date%20Player%20Opposition%20Goals%20Season}}}`, this.APP_SYNC_OPTIONS);
            var results = result.data.data.listTranmereWebHatTricks.items;

            results.sort(function(a, b) {
              if (a.Date < b.Date) return -1;
              if (a.Date > b.Date) return 1;
              return 0;
            });
            return results;
         }
    };
};