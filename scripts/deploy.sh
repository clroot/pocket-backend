#!/bin/bash
HOST_DIR=/home/ubuntu/app/pocket
BACK_END_REPO=pocket-backend
FRONT_END_REPO=pocket-frontend
DOCKER_APP_NAME=pocket-backend

EXIST_BLUE=$(docker ps -a | grep ${DOCKER_APP_NAME}-blue)

if [ -z "$EXIST_BLUE" ]; then
  RUN_TARGET=blue
  REMOVE_TARGET=green
  PORT=4001
else
  RUN_TARGET=green
  REMOVE_TARGET=blue
  PORT=4002
fi

echo "$RUN_TARGET is available"
docker run -d --name ${DOCKER_APP_NAME}-${RUN_TARGET} \
  -v $HOST_DIR/$BACK_END_REPO:/deploy/node-app \
  -v $HOST_DIR/$FRONT_END_REPO:/deploy/frontend/build \
  -p $PORT:4000 \
  clroot/node-app
sleep 5
echo "$RUN_TARGET is up"

echo "set \$service_url http://127.0.0.1:$PORT;" | sudo tee /etc/nginx/conf.d/pocket-url.inc
sudo service nginx reload
EXIST_REMOVE_TARGET=$(docker ps -a | grep ${DOCKER_APP_NAME}-${REMOVE_TARGET})

if [ "$EXIST_REMOVE_TARGET" ]; then
  echo "stoping previous host $REMOVE_TARGET...."
  docker rm -f ${DOCKER_APP_NAME}-${REMOVE_TARGET}
fi

echo "done"