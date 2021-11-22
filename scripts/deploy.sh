#!/bin/bash
HOST_DIR=/home/ubuntu/app/pocket
BACK_END_REPO=pocket-backend
FRONT_END_REPO=pocket-frontend
DOCKER_APP_NAME=pocket-backend

EXIST_NODE_MODULES=$(ls -al | grep node_modules)
if [ -z "$EXIST_NODE_MODULES" ]; then
  echo "Installing node modules..."
  npm install
fi

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

docker build ${HOST_DIR}/${BACK_END_REPO} -t ${DOCKER_APP_NAME}

echo "$RUN_TARGET is available"
docker run -d --name ${DOCKER_APP_NAME}-${RUN_TARGET} \
  -v $HOST_DIR/$BACK_END_REPO:/app/pocket-backend \
  -v $HOST_DIR/$FRONT_END_REPO/build:/app/pocket-frontend/build \
  -p $PORT:4000 \
  ${DOCKER_APP_NAME}
sleep 5
echo "$RUN_TARGET is up"

echo "set \$service_url http://127.0.0.1:$PORT;" | sudo tee /etc/nginx/conf.d/pocket-url.inc
sudo service nginx reload
EXIST_REMOVE_TARGET=$(docker ps -a | grep ${DOCKER_APP_NAME}-${REMOVE_TARGET})

if [ "$EXIST_REMOVE_TARGET" ]; then
  echo "stopping previous container $REMOVE_TARGET...."
  docker rm -f ${DOCKER_APP_NAME}-${REMOVE_TARGET}
fi

echo "done"
