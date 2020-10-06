module.exports = function (path, fs, Mustache, client, axios) {
    return {

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

         calculateStats : function(apps, goals) {

            var seasons = [];
            var total = {
                apps: 0,
                starts: 0,
                subs: 0,
                goals: 0,
                assists: 0,
                headers: 0,
                fk: 0,
                penalties: 0,
                yellow: 0,
                red: 0,
            };
            currentObj = {Season:0};
            for(var i=0; i < apps.length; i++) {
                if(apps[i].Season > currentObj.Season) {
                    if(currentObj.Season > 0) {
                        currentObj = this.calculateGoalsforSeason(currentObj, goals);
                        seasons.push(currentObj);
                        total = this.incrementPlayerTotals(total, currentObj);
                    }
                    currentObj = {
                        Season: apps[i].Season,
                        apps: 1,
                        starts: apps[i].isSub ? 0 : 1,
                        subs: apps[i].isSub ? 1 : 0,
                        yellow: apps[i].yellow ? 1: 0,
                        red: apps[i].red ? 1: 0,
                        goals: 0,
                        assists: 0,
                        headers: 0,
                        fk: 0,
                        penalties: 0
                    };
                } else {
                    currentObj.apps = currentObj.apps + 1;
                    currentObj.starts = apps[i].isSub ? currentObj.starts : currentObj.starts +1;
                    currentObj.subs = apps[i].isSub ? currentObj.subs + 1 : currentObj.subs;
                    currentObj.yellow = apps[i].yellow ? currentObj.yellow + 1 : currentObj.yellow;
                    currentObj.red = apps[i].red ? currentObj.red + 1 : currentObj.red;
                }
            }
            if(currentObj.Season > 0) {
                currentObj = this.calculateGoalsforSeason(currentObj, goals);
                seasons.push(currentObj);
                total = this.incrementPlayerTotals(total, currentObj);
            }

            return {seasons:seasons, total: total};
         },

         incrementPlayerTotals: function (total, currentObj) {
             total.apps = total.apps + 1;
             total.starts = total.starts + currentObj.starts;
             total.subs = total.subs + currentObj.subs;
             total.yellow = total.yellow + currentObj.yellow;
             total.red = total.red + currentObj.red;
             total.goals = total.goals + currentObj.goals;
             total.assists = total.assists + currentObj.assists;
             total.fk = total.fk + currentObj.fk;
             total.headers = total.headers + currentObj.headers;
             total.penalties = total.penalties + currentObj.penalties;
             return total;
         },

         calculateGoalsforSeason : function(currentObj, goals) {
             for(var x=0; x < goals.length; x++) {
                 if(currentObj.Season == goals[x].Season) {
                     currentObj.goals = goals[x].isGoal ? currentObj.goals + 1 : currentObj.goals;
                     currentObj.assists = goals[x].isAssist ? currentObj.assists + 1 : currentObj.assists;
                     if(goals[x].isGoal) {
                         currentObj.headers = goals[x].isHeader ? currentObj.headers + 1 : currentObj.headers;
                         currentObj.fk = goals[x].isFreeKick ? currentObj.fk + 1 : currentObj.fk;
                         currentObj.penalties = goals[x].isPenalty ? currentObj.penalties + 1 : currentObj.penalties;
                     }
                 }
             }
             return currentObj;
         },

         //Todo
         findGoalsTotalBySeasonAndPlayer : async function(size) {
             var query = {
                index: "goals",
                body: {
                    "size": 0,
                    "aggs": {
                      "Scorer": {
                        "terms": {
                          "field": "Scorer",
                        "size": size
                        },
                        "aggs": {
                          "Season": {
                            "terms": {
                              "field": "Season"
                            }
                          }
                        }
                      }
                    }
                }
             }

             var results = await client.search(query);
             var seasons = [];
             return obj.sort

         },

         comparePlayerSeasons : function ( a, b ) {
              if ( a.last_nom < b.last_nom ){
                return -1;
              }
              if ( a.last_nom > b.last_nom ){
                return 1;
              }
              return 0;
         },

         // Done
         findTranmereMatchesWithStars : async function(size) {
            var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebStars/ALL/ALL");
            var matches = [];
            for(var i=0; i < results.data.message.length; i++) {
                var star = results.data.message[i];
                var result = await axios.get("https://api.tranmere-web.com/result-search/?season="+star.season+"&date="+star.date);
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
         getAllMediaByType : async function(type) {
             var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebMediaTable/category/"+type);;
             var media = [];

             for(var i=0; i < results.data.message.length; i++) {
               var item = results.data.message[i];
               var image = {
                 "bucket": "trfc-programmes",
                 "key": results.data.message[i].image,
                 "edits": {
                   "resize": {
                     "height": 400,
                     "fit": "contain"
                   }
                 }
               };
               var link = {
                    "bucket": "trfc-programmes",
                    "key": results.data.message[i].image,
                    "edits": {
                     "resize": {
                       "height": 1200,
                       "fit": "contain"
                     }
                   }
               };
               item.imagePath = "https://images.tranmere-web.com/" + Buffer.from(JSON.stringify(image)).toString('base64');
               item.linkPath = "https://images.tranmere-web.com/" + Buffer.from(JSON.stringify(link)).toString('base64');
               media.push(item)
             }
             media.sort(function(a, b) {
               if (a.published < b.published) return -1
               if (a.published > b.published) return 1
               return 0
             });
             return media;
         },

         // Done
         findAllPlayers : async function() {
            var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebPlayerTable/ALL/ALL");
            var players = [];
            for(var i=0; i < results.data.message.length; i++) {
                var player = results.data.message[i];
                player.goals = await this.findGoalsByPlayer(player.name, 200);
                player.apps = await this.findAppsByPlayer(player.name, 1000);
                player.stats = this.calculateStats(player.apps, player.goals);
                players.push(player)
            }
            return players;
         },

         // Done
         findAllTranmereManagers : async function() {
            var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebManagers/ALL/ALL");

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

         // Maybe
         findGoalsByPlayer : async function(player, size, season) {
            var query = {
                index: "goals",
                body: {
                   "sort": ["Date"],
                   "size": size,
                   "query": {
                     "bool": {
                        "must": [
                          {
                              "match": {
                                "PlayersInvolved": player
                              }
                          }
                        ]
                      }
                   }
                }
              };
            if(season) {
                query.body.query.bool.must.push(
                    {
                        "match": {
                            "Season": season
                        }
                    }
                );
            }
            var goals = await client.search(query);
            var goalsList = [];
            for(var i=0; i < goals.body.hits.hits.length; i++){
                var goal = goals.body.hits.hits[i]["_source"];
                if(goal.Scorer == player) {
                    goal.isGoal = true;
                    if(goal.GoalType == "Header")
                        goal.isHeader = true;
                    else if(goal.GoalType == "Shot")
                        goal.isShot = true;
                    else if(goal.GoalType == "Penalty")
                        goal.isPenalty = true;
                    else if(goal.GoalType == "FreeKick")
                        goal.isFreeKick = true;
                    else
                        goal.isUnknown= true;
                } else {
                    goal.isAssist = true;
                    if(goal.AssistType == "Header")
                        goal.isHeader = true;
                    else if(goal.AssistType == "Cross")
                        goal.isCross = true;
                    else if(goal.AssistType == "Pass")
                        goal.isPass = true;
                    else if(goal.AssistType == "FreeKick")
                        goal.isFreeKick = true;
                    else if(goal.AssistType == "Corner")
                        goal.isCorner = true;
                    else
                        goal.isUnknown= true;
                }
                goalsList.push(goal);
            }

            return Promise.resolve(goalsList);
         },

         // Maybe
         findAppsByPlayer : async function(player, size, season) {
            var query = {
                index: "apps",
                body: {
                   "sort": ["Date"],
                   "size": size,
                   "query": {
                     "bool": {
                        "must": [
                          {
                              "match": {
                                "PlayersInvolved": player
                              }
                          }
                        ]
                      }
                   }
                }
              };

            if(season) {
                query.body.query.bool.must.push(
                    {
                        "match": {
                            "Season": season
                        }
                    }
                );
            }

            var apps = await client.search(query);
            var appsList = [];
            for(var i=0; i < apps.body.hits.hits.length; i++){
                var app = apps.body.hits.hits[i]["_source"];
                if(app.SubbedBy == player) {
                    app.isSub = true;
                    app.replaced = app.Name;
                    app.yellow = app.SubYellow;
                    app.red = app.SubRed;
                } else if(app.SubSubbedBy == player) {
                    app.isSub = true;
                    app.replaced = app.SubbedBy;
                    app.yellow = app.SubYellow;
                    app.red = app.SubRed;
                } else {
                    app.replaced = app.SubbedBy;
                    app.yellow = app.YellowCard;
                    app.red = app.RedCard;
                }
                appsList.push(app);
            }

            return Promise.resolve(appsList);
         },

         // Done
         getAllCupCompetitions : async function(size) {
            var results = await axios.get("https://api.tranmere-web.com/entities/TranmereWebClubs/ALL/ALL");
            return results.data.message;
        },

         // ?
         getTopScorersBySeason : async function(size) {
            var query = {
                index: "goals",
                body: {
                        "size": 0,
                        "aggs": {
                          "season": {
                            "terms": {
                              "size": size,
                              "field": "Season",
                              "order": {
                                "_key": "asc"
                              }
                            },
                            "aggs": {
                              "scorers": {
                                "terms": {
                                  "field": "Scorer",
                                  "size": 1
                                }
                              }
                            }
                          }
                        }
                      }
            };

            var result = await client.search(query);
            var results = [];
            for(var i=0; i < result.body.aggregations.season.buckets.length; i++) {
                var record = {
                    Name: result.body.aggregations.season.buckets[i].scorers.buckets[0].key,
                    Season: result.body.aggregations.season.buckets[i].key,
                    Goals: result.body.aggregations.season.buckets[i].scorers.buckets[0]['doc_count']
                }
                results.push(record);
            }
            return results;
        },

         // Done
         findAllTeams : async function(size) {
            var result = await axios.get("https://api.tranmere-web.com/entities/TranmereWebClubs/ALL/ALL");
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