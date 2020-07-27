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


rm /tmp/logstash
rm -rf /tmp/logstash4/
logstash -f 'data/*.conf' --log.level warn --path.data /tmp/logstash4 > data/log.txt