FROM node:10

MAINTAINER Ghilia Weldesselasie <ghili@3box.io>

COPY package.json package-lock.json ./

RUN npm install

COPY pinbot.js ./

EXPOSE  4002 4003

ENTRYPOINT ["node", "pinbot.js"]
