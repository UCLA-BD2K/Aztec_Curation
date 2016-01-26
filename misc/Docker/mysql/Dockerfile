FROM mysql

RUN sed -i 's/^#bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/' /etc/mysql/my.cnf

RUN mkdir /mysql

RUN sed -i '/datadir.*= \/var\/lib\/mysql/c\datadir = \/mysql' /etc/mysql/my.cnf

ADD ./startup.sh /opt/startup.sh

EXPOSE 3306

CMD ["/bin/bash", "/opt/startup.sh"]