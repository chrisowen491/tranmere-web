# Tranmere web API

##

`sam package --output-template-file packaged.yaml --s3-bucket tranmere-web-api`

`sam deploy --template-file packaged.yaml --stack-name Tranmere-Web-Api --capabilities CAPABILITY_IAM`