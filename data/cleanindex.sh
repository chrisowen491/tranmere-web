npm run export-excel
curl -i -X DELETE http://localhost:9200/apps -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/apps -H "Content-Type: application/json" --data-binary "@mappings/apps.mapping"
curl -i -X DELETE http://localhost:9200/goals -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/goals -H "Content-Type: application/json" --data-binary "@mappings/goals.mapping"
curl -i -X DELETE http://localhost:9200/players -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/players -H "Content-Type: application/json" --data-binary "@mappings/players.mapping"
curl -i -X DELETE http://localhost:9200/programmes -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/programmes -H "Content-Type: application/json" --data-binary "@mappings/programmes.mapping"
curl -i -X DELETE http://localhost:9200/managers -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/managers -H "Content-Type: application/json" --data-binary "@mappings/managers.mapping"
curl -i -X DELETE http://localhost:9200/teams -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/teams -H "Content-Type: application/json" --data-binary "@mappings/teams.mapping"
curl -i -X DELETE http://localhost:9200/matches -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/matches -H "Content-Type: application/json" --data-binary "@mappings/matches.mapping"
curl -i -X DELETE http://localhost:9200/stars -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/stars -H "Content-Type: application/json" --data-binary "@mappings/stars.mapping"
curl -i -X DELETE http://localhost:9200/links -H "Content-Type: application/json"
curl -i -X PUT http://localhost:9200/links -H "Content-Type: application/json"
rm /tmp/logstash
rm -rf /tmp/logstash4/
logstash -f '*.conf' --log.level warn --path.data /tmp/logstash4 > log.txt