# Milestone 0 Preparating Dev Env. Sample code to explain the relationship between modules

Build From Express ES2017 REST API Boilerplate
Original github https://github.com/danielfsousa/express-rest-es2017-boilerplate

Boilerplate/Generator/Starter Project for building RESTful APIs and microservices using Node.js, Express and MongoDB


## Requirements

 - [Node v7.6+](https://nodejs.org/en/download/current/) and [Docker](https://www.docker.com/)
 - [Yarn](https://yarnpkg.com/en/docs/install)

## Getting Started

Clone the repo and make it yours:

Install dependencies:

```bash
npm i
```

A docker image is offered for running the rendezvous service in local machine instead of the free server /dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star
```bash
docker pull libp2p/websocket-star-rendezvous:release
docker run -d -p 9090:9090 --name rendezvous libp2p/websocket-star-rendezvous:release
```
BTW, To disable prometheus metrics run the server with -e DISABLE_METRICS=1


# Compile client side node simulator
```bash
npm run compile
```

## Running LayerOne AKA block server simulator
```bash
npm run dev
```

## Unit Test

```bash
# run all tests with Mocha
npm run test
```
# Run

## Show multiple running node simulators
In browser open http://localhost:3000/ and click 'demo'. You can see a list of pre-created nodes links. You would better start multiple (suggest > 6) nodes in separated browser windows NOT TABS. Try to tile them in the screen side by side, so that you can see them at the same time. Another benefit is some browser (eg. Chrome) reduce the background js when tab is not visible. Doing so can make sure the js run faster. Of course, it burns more electricity. 
## Show the overview of all nodes in one window
The http://localhost:3000/webportal shows you the overview of all running nodes. You'd better show it all the time in a separate browser window too.
## Status, Action and Log
In each node simulator window, you can switch between 3 tabs. In Action tab you can start a new task. In Log tab, you can see what is happening inside this node. In Status tab (the first tab with user name and room number on the title) you can see current gas balance and credit balance. 

## Manually force generate a new block
At the time of your demo, we should already start auto block generate periodically. If it doesn't, or you do not want to wait for next block to be generated on schedule, you can always click the "block#NUMBER" tabl to force generate new block right now. A new tab will be open showing the content of new block. 




<!-- 
# run unit tests
yarn test:unit

# run integration tests
yarn test:integration

# run all tests and watch for changes
yarn test:watch

# open nyc test coverage reports
yarn coverage
```

## Validate

```bash
# run lint and tests
yarn validate
```

## Logs

```bash
# show logs in production
pm2 logs
```

## Documentation

```bash
# generate and open api documentation
yarn docs
```

## Docker

```bash
# run container locally
yarn docker:dev
or
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# run container in production
yarn docker:prod
or
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up

# run tests
yarn docker:test
or
docker-compose -f docker-compose.yml -f docker-compose.test.yml up
```

## Deploy

Set your server ip:

```bash
DEPLOY_SERVER=127.0.0.1
```

Replace my Docker username with yours:

```bash
nano deploy.sh
```

Run deploy script:

```bash
yarn deploy
or
sh ./deploy.sh
``` -->

