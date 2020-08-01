mkdir  ./tmp/goals
mkdir  ./tmp/stars
mkdir  ./tmp/programmes
mkdir  ./tmp/managers
mkdir  ./tmp/links
mkdir  ./tmp/transfers
mkdir  ./tmp/clubs
mkdir  ./tmp/players
mkdir  ./tmp/media
mkdir  ./tmp/tickets
mkdir  ./tmp/games
mkdir  ./tmp/apps
mkdir  ./tmp/apps-master
mkdir  ./tmp/apps-master/raw
mkdir  ./tmp/apps/1984
mkdir  ./tmp/apps/1985
mkdir  ./tmp/apps/1986
mkdir  ./tmp/apps/1987
mkdir  ./tmp/apps/1988
mkdir  ./tmp/apps/1989
mkdir  ./tmp/apps/1990
mkdir  ./tmp/apps/1991
mkdir  ./tmp/apps/1992
mkdir  ./tmp/apps/1993
mkdir . ./tmp/apps/1994
mkdir . ./tmp/apps/1995
mkdir . ./tmp/apps/1996
mkdir . ./tmp/apps/1997
mkdir . ./tmp/apps/2017

npm run export-excel
curl -i -X DELETE http://localhost:9200/apps -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/apps -H "Content-Type: application/json" --data-binary "@data/mappings/apps.mapping"
curl -i -X DELETE http://localhost:9200/goals -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/goals -H "Content-Type: application/json" --data-binary "@data/mappings/goals.mapping"
curl -i -X DELETE http://localhost:9200/players -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/players -H "Content-Type: application/json" --data-binary "@data/mappings/players.mapping"
curl -i -X DELETE http://localhost:9200/programmes -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/programmes -H "Content-Type: application/json" --data-binary "@data/mappings/programmes.mapping"
curl -i -X DELETE http://localhost:9200/managers -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/managers -H "Content-Type: application/json" --data-binary "@data/mappings/managers.mapping"
curl -i -X DELETE http://localhost:9200/teams -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/teams -H "Content-Type: application/json" --data-binary "@data/mappings/teams.mapping"
curl -i -X DELETE http://localhost:9200/matches -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/matches -H "Content-Type: application/json" --data-binary "@data/mappings/matches.mapping"
curl -i -X DELETE http://localhost:9200/stars -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/stars -H "Content-Type: application/json" --data-binary "@data/mappings/stars.mapping"
curl -i -X DELETE http://localhost:9200/transfers -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/transfers -H "Content-Type: application/json" --data-binary "@data/mappings/transfers.mapping"
curl -i -X DELETE http://localhost:9200/links -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/links -H "Content-Type: application/json" --data-binary "@data/mappings/links.mapping"
curl -i -X DELETE http://localhost:9200/media -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/media -H "Content-Type: application/json" --data-binary "@data/mappings/media.mapping"
curl -i -X DELETE http://localhost:9200/tickets -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/tickets -H "Content-Type: application/json" --data-binary "@data/mappings/tickets.mapping"


rm  /tmp/logstash
rm -rf  ./tmp/logstash4/
logstash -f 'data/*.conf' --log.level warn --path.data  ./tmp/logstash4 > ./tmp/log.txt