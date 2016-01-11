#!/bin/bash

if [ ! -f /var/lib/mysql/ibdata1 ]; then

    mysql_install_db

    /usr/bin/mysqld_safe &
    sleep 10s

    echo "CREATE USER 'developer'@'%' IDENTIFIED BY 'ucla2015';"
    echo "GRANT ALL ON *.* TO admin@'%' IDENTIFIED BY 'ucla2015' WITH GRANT OPTION; FLUSH PRIVILEGES" | mysql
    echo "GRANT ALL ON *.* TO developer@'%' IDENTIFIED BY 'ucla2015' WITH GRANT OPTION; FLUSH PRIVILEGES" | mysql
    echo "create database AZ_Curation;" | mysql


    killall mysqld
    sleep 10s
fi

/usr/bin/mysqld_safe
