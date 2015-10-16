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
* cd into the Docker folder and then run ./run-server.sh to run mysql database
* Create a file called mysql.js inside config/connect/ folder [Also in Vincent's pastebin]
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
* To start webserver, run:
```js
$ sudo npm install
$ npm start
# using nodemon, first install, then call nodemon
$ npm install -g nodemon
$ nodemon
