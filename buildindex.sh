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
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/apps -H "Content-Type: application/json" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/apps -H "Content-Type: application/json" --data-binary "@data/mappings/apps.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/goals -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/goals -H "Content-Type: application/json" --data-binary "@data/mappings/goals.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/players -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/players -H "Content-Type: application/json" --data-binary "@data/mappings/players.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/programmes -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/programmes -H "Content-Type: application/json" --data-binary "@data/mappings/programmes.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/managers -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/managers -H "Content-Type: application/json" --data-binary "@data/mappings/managers.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/teams -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/teams -H "Content-Type: application/json" --data-binary "@data/mappings/teams.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/matches -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/matches -H "Content-Type: application/json" --data-binary "@data/mappings/matches.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/stars -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/stars -H "Content-Type: application/json" --data-binary "@data/mappings/stars.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/transfers -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/transfers -H "Content-Type: application/json" --data-binary "@data/mappings/transfers.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/links -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/links -H "Content-Type: application/json" --data-binary "@data/mappings/links.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/media -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/media -H "Content-Type: application/json" --data-binary "@data/mappings/media.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X DELETE https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/tickets -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="
curl -i -X PUT https://e1450e31845040639d816d03009c1e1d.europe-west2.gcp.elastic-cloud.com:9243/tickets -H "Content-Type: application/json" --data-binary "@data/mappings/tickets.mapping" -H "authorization: Basic ZWxhc3RpYzpZc01PSnJSZ0Z0azc1aDRNRURSd3VTd3Q="

rm  /tmp/logstash
rm -rf  ./tmp/logstash4/
logstash -f 'data/*.conf' --log.level warn --path.data  ./tmp/logstash4 > ./tmp/log.txt