#!/bin/sh
service mysql stop
docker rm aztec_mysql
docker run -d --name aztec_mysql -p 3306:3306 vincekyi/aztec-mysql
