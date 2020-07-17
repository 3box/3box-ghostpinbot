FROM node:12

MAINTAINER Janko Simonovic <janko@3box.io>

# Create app directory
WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .

CMD [ "node", "app.js" ]
