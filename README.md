# Aztec Curation Tool
This web application is used to populate the metadata of the tools in Aztec.

## Setting Up the Environment

### [Docker Compose](https://docs.docker.com/compose/install/)
Use Docker Compose to setup both MySQL and MongoDB.  To set up the databases, run the following command in the root folder.
```js
docker-compose up
```

## Server Setup

* Pull Repository
* Run docker-compose to get the databases up and running
* Create a file called mysql.js inside config folder [Ask Vincent for the file]
* May need to change 'host' depending on the location of MySQL database. (Usually localhost, but different for Mac)
* Contents of mysql.js should look like:
```js

module.exports = {
  client: 'mysql',
  connection: {
    host     : '',
    port     : '',
    user     : '',
    password : '',
    database : '',
    charset: 'utf8'
  },
  pool: {
    min: 0,
    max: 4
  }
};


```
* Create a file called mongo.js inside the config folder if it does not already exist
* Contents of mysql.js should look like:
```js

module.exports = {

    'url' : 'mongodb://username:password@host:port/Tool'

};


```
* To start webserver, run:
```js
$ sudo npm install
$ npm start
# using nodemon, first install, then call nodemon
$ npm install -g nodemon
$ nodemon
