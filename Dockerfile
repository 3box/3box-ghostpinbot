FROM node:10

MAINTAINER Ghilia Weldesselasie <ghili@3box.io>

COPY package.json
ADD  package-lock.json

COPY pinbot.js

RUN npm install

EXPOSE  4002 4003

ARG 3box_chat_room

CMD pinbot 3box_chat_room
