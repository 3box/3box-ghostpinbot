FROM node:10

MAINTAINER Janko Simonovic <janko@3box.io>

# Create app directory
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 8081 4001 4002 5001 9001

CMD [ "node", "app.js" ]