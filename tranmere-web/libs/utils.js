module.exports = function (path, fs, Mustache, axios, key) {
    return {
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
            var tpl = `./tranmere-web/templates/partials/${templateKey}.partial.mustache`;
            return Mustache.render(fs.readFileSync(tpl).toString(), view, this.loadSharedPartials());
         },

         // Done
         findTranmereMatchesWithStars : async function(size) {
            var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebStarsTable/ALL/ALL", this.apiOptions);
            var matches = [];
            for(var i=0; i < results.data.message.length; i++) {
                var star = results.data.message[i];
                var result = await axios.get("https://api.tranmere-web.com/result-search/?season="+star.season+"&date="+star.date, this.apiOptions);
                var match = result.data;
                match.Player = star.name;
                match.Notes = star.notes;
                matches.push(match);
            }
            matches.sort(function(a, b) {
               if (a.date < b.date) return -1
               if (a.date > b.date) return 1
               return 0
            });
            return matches;
         },

         // Done
         findAllPlayers : async function() {
            var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebPlayerTable/ALL/ALL", this.apiOptions);
            var players = [];
            for(var i=0; i < results.data.message.length; i++) {
                var player = results.data.message[i];
                players.push(player);
            }
            return players;
         },

         // Done
         findAllTranmereManagers : async function() {
            var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebManagers/ALL/ALL", this.apiOptions);

            var managers = [];
            for(var i=0; i < results.data.message.length; i++) {
                var manager = results.data.message[i];
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
            var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebCompetitions/ALL/ALL", this.apiOptions);
            return results.data.message;
        },

         // done
         getTopScorersBySeason : async function() {

            var results = [];

            for(var i= 1977; i < 2021; i++) {
                var result = await axios.get("https://api.tranmere-web.com/player-search/?season="+i+"&sort=Goals", this.apiOptions);
                var player = result.data.players[0];
                results.push(player);
            }
            return results;
         },

         // Done
         findAllTeams : async function(size) {
            var result = await axios.get("https://api.tranmere-web.com/entities/TranmereWebClubs/ALL/ALL", this.apiOptions);
            var results = result.data.message;

            results.sort(function(a, b) {
              if (a.name < b.name) return -1;
              if (a.name > b.name) return 1;
              return 0;
            });
            return results;
         }
    };
};