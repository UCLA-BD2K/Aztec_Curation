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
* Create a folder named 'connect' and create a file called mysql.js inside folder [Also in Vincent's pastebin]
* Contents of mysql.js should look like:
```js

module.exports = {
  host     : '',
  port     : '',
  user     : '',
  password : '',
  database : 'AZ_Curation',
  connectionLimit : 4
};

```
* To start webserver, run:
```js
$ npm start
# using nodemon, first install, then call nodemon
$ npm install -g nodemon
$ nodemon
