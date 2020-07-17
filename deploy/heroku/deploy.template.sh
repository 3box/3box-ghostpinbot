#!/bin/bash

heroku container:login

heroku apps:destroy --app <API_APP_NAME> --confirm <API_APP_NAME>
heroku apps:destroy --app <PEER_APP_NAME> --confirm <PEER_APP_NAME>

heroku create -a <API_APP_NAME>
heroku create -a <PEER_APP_NAME>

heroku config:set -a <API_APP_NAME> EXECUTION_MODE=API

heroku config:set -a <PEER_APP_NAME> EXECUTION_MODE=PEER
heroku config:set -a <PEER_APP_NAME> API_CALLBACK_URL=https://<API_APP_NAME>.herokuapp.com
heroku config:set -a <PEER_APP_NAME> BASE_WS_URL=<PEER_APP_NAME>.herokuapp.com

docker tag ghostpinbot registry.heroku.com/<API_APP_NAME>/web
docker push registry.heroku.com/<API_APP_NAME>/web

docker tag ghostpinbot registry.heroku.com/<PEER_APP_NAME>/web
docker push registry.heroku.com/<PEER_APP_NAME>/web

heroku container:release web --app <API_APP_NAME>
heroku container:release web --app <PEER_APP_NAME>
