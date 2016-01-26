FROM node:latest

ADD ./start.sh /opt/start.sh

RUN mkdir /src

VOLUME /src

WORKDIR /src

EXPOSE 3000

RUN npm install -g nodemon

CMD ["/bin/bash", "/opt/start.sh"]
