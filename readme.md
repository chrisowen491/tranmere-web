# Tranmere Web.com

This site is a demo site using Tarnmere Rovers data to demonstrate all sorts of website functionality. It is not meant as a commercial entity, and is purely for fun. 

## Frontend - Static HTML, JQuery, Saas
Source code for Tranmere-Web.com. The site is a static site designed to be deployed via cloudflare pages.

### Prerequisites

 * Scripts are designed for Linux/Mac
 * Node v16+, NPM

### Building

Set Key Env variables

```bash
export ENVIRONMENT=local
export CF_SPACE=
export CF_KEY=
export AL_SPACE=
export AL_KEY=
export AL_INDEX=
export VERSION=
```

```bash
$ npm install
$ npm run build-web
$ npm run build
```

### Local Testing (Using production backend)

```bash
$ npm run local-web-prod
```

## Backend - AWS Lambda, AppSync, CDK

Set Key Env variables

```bash
export ENVIRONMENT=
export EMAIL_ADDRESS=
export CF_SPACE=
export CF_KEY=
export SCRAPE_ID=
export SCRAPE_SEASON=
export SCRAPE_ID=
export DD_KEY=
export VERSION=
```

### Deployment

```bash
$ cdk deploy
```

### Local Testing


Make sure AWS SAM is installed

```bash
$ brew tap aws/tap
$ brew install aws-sam-cli
$ sam --version
```

You will need docker runing too.

```bash
$ npm run local-api
```

### Running Local Acceptance Tests 

```bash
$ npm run local-acceptance-test
```

## Deploying Images

```bash
$ aws s3 sync ./images s3://trfc-programmes
```

#https://icomoon.io/#preview-free