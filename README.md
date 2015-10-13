# Aztec Curation Tool
This web application is used to populate the metadata of the tools in Aztec.

##Docker Images Usage

###[MySQL](https://hub.docker.com/_/mysql/)
```js
docker pull vincekyi/aztec-mysql
```

##Server Setup

* Pull Repository
* Pull aztec-mysql database from Docker
* Run /Docker/run-server.sh to run mysql database
* To start webserver, run:
```js
$ node start
# runs node start
$ npm
# using nodemon, first install, then call nodemon
$ npm install -g nodemon
$ nodemon
