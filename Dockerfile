FROM node:10

MAINTAINER Ghilia Weldesselasie <ghili@3box.io>

COPY package.json
COPY bot.js

RUN npm install

CMD bot <chat-room-name>
