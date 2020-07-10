module.exports = function (path, fs, Mustache,client) {
    return {

         pages: [],

         pad: function(a,b){
            return(1e15+a+"").slice(-b)
         },

         buildSitemapEntry: function(page) {
            var m = new Date();
            var dateString = m.getUTCFullYear() +"-"+ this.pad(m.getUTCMonth()+1,2) +"-"+this.pad(m.getUTCDate(),2);
            return {
                url: page.replace('./tranmere-web/output/site/','/').replace('&', '&amp;'),
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

         buildPage: function (view, pageTpl, outputPath) {
            if(outputPath != './tranmere-web/output/site/index.html')
                view.url = outputPath.replace('./tranmere-web/output/site/','/');
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
            this.pages.push(this.buildSitemapEntry(outputPath));
            fs.writeFile(outputPath, pageHTML, function (err) {
                if (err) return console.log(err);
            });
         },

         calculateWinsDrawsLossesFromMatchesSearch : function(results) {
             var obj = {
                wins: 0,
                draws: 0,
                losses: 0
             }
             for(var m=0; m<results.length; m++) {
                 var r = results[m];
                 if(r.home == "Tranmere Rovers" && r.hgoal > r.vgoal) {
                     obj.wins = obj.wins + 1;
                 } else if(r.visitor == "Tranmere Rovers" && r.vgoal > r.hgoal) {
                     obj.wins = obj.wins + 1;
                 } else if(r.vgoal == r.hgoal) {
                     obj.draws = obj.draws +1;
                 } else {
                     obj.losses = obj.losses+1;
                 }
             }
             return obj;
         },

         findAllPlayers : async function(size) {
            var playersQuery = {
                index: "players",
                body: {
                    "sort": ["Name"],
                    "size": size,
                }
            };
            var results = await client.search(playersQuery);
            var players = [];
            for(var i=0; i < results.body.hits.hits.length; i++) {
                var player = results.body.hits.hits[i]["_source"];
                player.Id = results.body.hits.hits[i]["_id"]
                player.goals = await this.findGoalsByPlayer(player.Name, 500);
                player.apps = await this.findAppsByPlayer(player.Name, 500);
                player.links = await this.getLinksByPlayer(player.Name);
                player.stats = this.calculateStats(player.apps, player.goals);
                players.push(player)
            }
            return players;
         },

         findAllTranmereManagers : async function(size) {
            var managersQuery = {
                index: "managers",
                body: {
                    "sort": [{"DateJoined" : {"order" : "desc"}}],
                    "size": size,
                }
            };
            var results = await client.search(managersQuery);
            var managers = [];
            for(var i=0; i < results.body.hits.hits.length; i++) {
                var manager = results.body.hits.hits[i]["_source"];
                var dateLeft = "now";
                if(manager.DateLeft)
                    dateLeft = manager.DateLeft;
                manager.DateLeftText = dateLeft;
                manager.Id = results.body.hits.hits[i]["_id"]
                managers.push(manager)
            }
            return managers;
         },

         findAllTranmereMatchesWithinTimePeriod : async function(from, to, size) {
            var query = {
                index: "matches",
                body: {
                   "sort": ["Date"],
                   "size": size,
                   "query": {
                     "bool": {
                        "must": [
                          {
                             "range": {
                               "Date": {
                                 "gte": from,
                                 "lte": to
                               }
                             }
                          },
                          {
                              "match": {
                                "teams": "Tranmere Rovers"
                              }
                          }
                        ]
                      }
                   }
                }
              };

            var results = await client.search(query);
            var matches = [];
            for(var i=0; i < results.body.hits.hits.length; i++) {
                var match = results.body.hits.hits[i]["_source"];
                var apps = await this.getAppsByDate(match.Date);
                match.apps = apps;
                matches.push(match)
            }
            return matches;
         },

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
                    else if(goal.GoalType == "Free Kick")
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
                    else if(goal.AssistType == "Free Kick")
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
                if(app.Name != player) {
                    app.isSub = true;
                    app.replaced = app.Name;
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

        getTopPlayerByAppearnces : async function(size) {
            var query = {
                index: "apps",
                body: {
                      "size": 0,
                      "aggs": {
                        "apps": {
                          "terms": {
                            "size" : size,
                            "field": "Name"
                          }
                        },
                        "subs": {
                         "terms": {
                            "size" : size,
                            "field": "SubbedBy"
                          }
                        }
                      }
                  }
            };

            var result = await client.search(query);
            var results = [];
            for(var i=0; i < result.body.aggregations.apps.buckets.length; i++) {
                var player = result.body.aggregations.apps.buckets[i].key;
                var subs = 0;
                for(var x=0; x<result.body.aggregations.subs.buckets.length; x++) {
                    if(result.body.aggregations.subs.buckets[x].key == player) {
                        subs = result.body.aggregations.subs.buckets[x].doc_count;
                    }
                }

                results.push({"Name": player, Subs:subs, "Starts": result.body.aggregations.apps.buckets[i].doc_count})
            }
            return results;
        },

        getTopPlayerByGoals : async function(size) {
            var query = {
                index: "goals",
                body: {
                      "size": 0,
                      "aggs": {
                        "Scorer": {
                          "terms": {
                            "size" : size,
                            "field": "Scorer"
                          }
                        }
                      }
                  }
            };

            var result = await client.search(query);
            var results = [];
            for(var i=0; i < result.body.aggregations.Scorer.buckets.length; i++) {
                var player = result.body.aggregations.Scorer.buckets[i].key;
                results.push({"Name": player, "Goals": result.body.aggregations.Scorer.buckets[i].doc_count})
            }
            return results;
        },

        getAllCupCompetitions : async function(size) {
            var competitionQuery = {
                index: "matches",
                body: {
                    "size": 0,
                    "aggs": {
                      "competition": {
                        "terms": {
                          "size" : size,
                          "field": "competition"
                        }
                      }
                    }
                }
            };

            var result = await client.search(competitionQuery);
            var results = [];
            for(var i=0; i < result.body.aggregations.competition.buckets.length; i++) {
                if(result.body.aggregations.competition.buckets[i].key != "League"
                    && result.body.aggregations.competition.buckets[i].key != "Conference") {
                    results.push({"Name": result.body.aggregations.competition.buckets[i].key, "Count": result.body.aggregations.competition.buckets[i].doc_count})
                }
            }
            return results;
        },

         findAllTeams : async function(size) {
            var teamQuery = {
                index: "matches",
                body: {
                    "size": 0,
                    "query": {
                      "match": {
                        "teams": "Tranmere Rovers"
                      }
                    },
                    "aggs": {
                      "teams": {
                        "terms": {
                          "size" : size,
                          "field": "teams"
                        }
                      }
                    }
                }
            };

            var result = await client.search(teamQuery);
            var results = [];
            var resultsByLetter = {};
            for(var i=0; i < result.body.aggregations.teams.buckets.length; i++) {
                if(result.body.aggregations.teams.buckets[i].key != "Tranmere Rovers") {

                    var firstLetter = result.body.aggregations.teams.buckets[i].key.substring(0,1);
                    if(resultsByLetter[firstLetter]) {
                        resultsByLetter[firstLetter].push(result.body.aggregations.teams.buckets[i].key)
                    } else {
                        var obj = [result.body.aggregations.teams.buckets[i].key];
                        resultsByLetter[firstLetter] = obj;
                    }
                    results.push(result.body.aggregations.teams.buckets[i])
                }
            }
            var list = [];
            var keys = Object.keys(resultsByLetter);
            for(var i=0; i < keys.length; i++) {
                list.push({key: keys[i], teams: resultsByLetter[keys[i]]});
            }
            results.sort(function(a, b) {
              if (a.key < b.key) return -1;
              if (a.key > b.key) return 1;
              return 0;
            });
            list.sort(function(a, b) {
              if (a.key < b.key) return -1;
              if (a.key > b.key) return 1;
              return 0;
            });
            return {results:results, resultsByLetter:list};
         },

         findTranmereMatchesSortedByTopAttendance : async function(size) {
            var query = {
                index: "matches",
                body: {
                   "sort": [{"attendance" : {"order" : "desc"}}],
                   "size": size,
                }
              };
            var results = await client.search(query);
            var matches = [];
            for(var i=0; i < results.body.hits.hits.length; i++) {
                var match = results.body.hits.hits[i]["_source"];
                matches.push(match)
            }
            return matches;
         },

         findAllTranmereMatchesByVenue : async function(venue, size) {
            var query = {
                index: "matches",
                body: {
                   "sort": ["Date"],
                   "size": size,
                   "query": {
                    "match": {
                     "Venue": venue
                    }
                   }
                }
              };
            var results = await client.search(query);
            var matches = [];
            for(var i=0; i < results.body.hits.hits.length; i++) {
                var match = results.body.hits.hits[i]["_source"];
                var apps = await this.getAppsByDate(match.Date);
                match.apps = apps;
                var goals = await this.getGoalsByDate(match.Date);
                match.goals = goals;
                match.isCup = true;
                matches.push(match)
            }
            return matches;
         },

         findAllTranmereMatchesByCompetition : async function(competition, size) {
            var query = {
                index: "matches",
                body: {
                   "sort": ["Date"],
                   "size": size,
                   "query": {
                    "match": {
                     "competition": competition
                    }
                   }
                }
              };
            var results = await client.search(query);
            var matches = [];
            for(var i=0; i < results.body.hits.hits.length; i++) {
                var match = results.body.hits.hits[i]["_source"];
                var apps = await this.getAppsByDate(match.Date);
                match.apps = apps;
                var goals = await this.getGoalsByDate(match.Date);
                match.goals = goals;
                match.isCup = true;
                matches.push(match)
            }
            return matches;
         },

         findAllTranmereMatchesByOpposition : async function(opposition, size) {
            var query = {
                index: "matches",
                body: {
                   "sort": ["Date"],
                   "size": size,
                   "query": {
                     "bool": {
                        "must": [
                          {
                            "match": {
                             "teams": opposition
                            }
                          },
                          {
                              "match": {
                                "teams": "Tranmere Rovers"
                              }
                          }
                        ]
                      }
                   }
                }
              };
            var results = await client.search(query);
            var matches = [];
            for(var i=0; i < results.body.hits.hits.length; i++) {
                var match = results.body.hits.hits[i]["_source"];
                var apps = await this.getAppsByDate(match.Date);
                match.apps = apps;
                var goals = await this.getGoalsByDate(match.Date);
                match.goals = goals;
                matches.push(match)
            }
            return matches;
         },

         getProgrammesBySeason : async function(season) {
              var query = {
                index: "programmes",
                body: {
                   "sort": ["Date"],
                   "size": 100,
                   "query": {
                     "bool": {
                        "must": [
                          {
                            "match": {
                             "Season" : season
                            }
                          }
                        ]
                      }
                   }
                }
              };

             var results = await client.search(query);
             var programmes = {};
             for(var i=0; i < results.body.hits.hits.length; i++) {
                var programme = results.body.hits.hits[i]["_source"];
                programmes[programme.Date] = programme
             }
             return programmes;
         },

         getAppsByDate : async function(date) {
              var query = {
                index: "apps",
                body: {
                   "sort": ["Number"],
                   "size": 20,
                   "query": {
                     "bool": {
                        "must": [
                          {
                            "match": {
                             "Date" : date
                            }
                          }
                        ]
                      }
                   }
                }
              };

             var results = await client.search(query);
             var apps = [];
             for(var i=0; i < results.body.hits.hits.length; i++) {
                var app = results.body.hits.hits[i]["_source"];
                apps.push(app)
             }
             return apps;
         },

         getGoalsByDate : async function(date) {
               var query = {
                 index: "goals",
                 body: {
                    "size": 20,
                    "query": {
                      "bool": {
                         "must": [
                           {
                             "match": {
                              "Date" : date
                             }
                           }
                         ]
                       }
                    }
                 }
               };

              var results = await client.search(query);
              var goals = [];
              for(var i=0; i < results.body.hits.hits.length; i++) {
                 var goal = results.body.hits.hits[i]["_source"];
                 goals.push(goal)
              }
              return goals;
          },

         getLinksByPlayer : async function(name, size) {
              var query = {
                index: "links",
                body: {
                   "size": size,
                   "query": {
                     "bool": {
                        "must": [
                          {
                            "match": {
                             "Name" : name
                            }
                          }
                        ]
                      }
                   }
                }
              };

             var results = await client.search(query);
             var links = [];
             for(var i=0; i < results.body.hits.hits.length; i++) {
               var link = results.body.hits.hits[i]["_source"];
               links.push(link)
             }
             return links;
         },


         findAllTranmereMatchesBySeason : async function(season, size) {
            var query = {
                index: "matches",
                body: {
                   "sort": ["Date"],
                   "size": size,
                   "query": {
                     "bool": {
                        "must": [
                          {
                            "match": {
                             "Season" : season
                            }
                          },
                          {
                              "match": {
                                "teams": "Tranmere Rovers"
                              }
                          }
                        ]
                      }
                   }
                }
              };
            var results = await client.search(query);
            var programmes = await this.getProgrammesBySeason(season);
            var processResults = [];
            for(var i=0; i < results.body.hits.hits.length; i++) {
               var match = results.body.hits.hits[i]["_source"];
               if(programmes && programmes[match.Date]) {
                var programme = programmes[match.Date];
                var smallBody = {
                     "bucket": programme.Bucket,
                     "key": programme.Path,
                     "edits": {
                       "resize": {
                         "width": 50,
                         "fit": "contain"
                       }
                     }
                   };
                    var largeBody = {
                         "bucket": programme.Bucket,
                         "key": programme.Path,
                       };
                match.programme = Buffer.from(JSON.stringify(smallBody)).toString('base64');
                match.largeProgramme = Buffer.from(JSON.stringify(largeBody)).toString('base64');
               }
               match.Opposition = match.home == "Tranmere Rovers" ? match.visitor : match.home;
               var apps = await this.getAppsByDate(match.Date);
               match.apps = apps;
               var goals = await this.getGoalsByDate(match.Date);
               match.goals = goals;
               processResults.push(match);
            }
            return processResults;
         }
    };
};