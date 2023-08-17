# Tranmere Web.com

This site is a demo site using Tarnmere Rovers data to demonstrate all sorts of website functionality. It is not meant as a commercial entity, and is purely for fun. 

Most functionality is provided using free tools, but the the AWS Backend and [DataDog](https://www.datadoghq.com/) monitoring require paid for subscriptions.

## Frontend - Static HTML, JQuery, Saas
Source code for [Tranmere-Web.com](https://www.tranmere-web.com). 

The site is a static site designed to be deployed via [cloudflare pages](https://pages.cloudflare.com/).

Site search is powered by [algloia](https://www.algolia.com/) - with pages indexed at build time.

## Backend - AWS Serverless

Dynamic elements are powered using a combination of AWS Lambda, AppSync, DynamoDb and [Contentful CMS](https://www.contentful.com/). Builds are executed using [GitHub Actions](https://github.com/features/actions).


### Prerequisites

 * Scripts are designed for Linux/Mac
 * Node v16+, NPM

### Install

```bash
$ npm install
```

### Local Testing/DEvelopment (Using CDK backend)


In a terminal - set Key Env variables

```bash
export ENVIRONMENT=local
export CF_SPACE=<<Contentful Space Id>>
export CF_KEY=CF_SPACE=<<Contentful  API Key>>
export AL_SPACE=<<Algolia Space Id>>
export AL_KEY=<<Algolia API Key>>
export AL_INDEX=<<Algolia Index Name>>
```


```bash
$ npm run start
```

In another terminal make sure AWS SAM is installed. You will need docker runing too.

```bash
$ brew tap aws/tap
$ brew install aws-sam-cli
$ sam --version
```
Set Key Env variables

```bash
export ENVIRONMENT=local
export EMAIL_ADDRESS=
export CF_SPACE=
export CF_KEY=
export SCRAPE_ID=
export SCRAPE_SEASON=
export SCRAPE_ID=
export VERSION=1.0.0
```


```bash
$ npm run local-api
```

### Running Local Acceptance Tests 

```bash
$ npm run local-acceptance-test
```

### Deployment

Set Key Env variables

```bash
export ENVIRONMENT=local
export EMAIL_ADDRESS=
export CF_SPACE=
export CF_KEY=
export SCRAPE_ID=
export SCRAPE_SEASON=
export SCRAPE_ID=
export DD_KEY=
export VERSION=1.0.0
```

```bash
$ cdk deploy
```


## Deploying Images

```bash
$ aws s3 sync ./images s3://trfc-programmes
```

#https://icomoon.io/#preview-free