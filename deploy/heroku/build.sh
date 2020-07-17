#!/bin/bash

docker build --tag ghostpinbot .

# clean build
rm -rf ./deploy/heroku/build
mkdir ./deploy/heroku/build

# move templates to build
cp ./deploy/heroku/deploy.template.sh ./deploy/heroku/build/deploy.sh

# replace API_APP_NAME
find ./deploy/heroku/build -type f -print0 | xargs -0 sed -i '' -e "s/<API_APP_NAME>/$1/g"
# replace PEER_APP_NAME
find ./deploy/heroku/build -type f -print0 | xargs -0 sed -i '' -e "s/<PEER_APP_NAME>/$2/g"

chmod +x ./deploy/heroku/build/deploy.sh
