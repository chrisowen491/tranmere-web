module.exports = function (path, fs, Mustache,client) {
    return {
         loadSharedPartials: function() {
           var partials = {};

           var files = fs.readdirSync('./templates/partials');
           for (var i = 0, l = files.length; i < l; i++) {
             var file = files[i];

             if (file.match(/\.partial\.mustache$/)) {
               var name = path.basename(file, '.partial.mustache');
               partials[name] = fs.readFileSync('./templates/partials/' + file, {
                 encoding: 'utf8'
               });
             }
           }
           return partials;
         },
         buildPage: function (view, pageTpl, outputPath) {
            var pageHTML = Mustache.render(fs.readFileSync(pageTpl).toString(), view, this.loadSharedPartials());
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
                 if(r["_source"].home == "Tranmere Rovers" && r["_source"].result == "H") {
                     obj.wins = obj.wins + 1;
                 } else if(r["_source"].visitor == "Tranmere Rovers" && r["_source"].result == "A") {
                     obj.wins = obj.wins + 1;
                 } else if(r["_source"].result == "D") {
                     obj.draws = obj.draws +1;
                 } else {
                     obj.losses = obj.losses+1;
                 }
             }
             return obj;
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

            return client.search(query);
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

             return client.search(query);
         }
    };
};