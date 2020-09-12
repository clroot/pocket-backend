#!/bin/bash

DOCKER_APP_NAME=pocket-backend

EXIST_BLUE=$(docker ps | grep ${DOCKER_APP_NAME}-blue)

if [ -z "$EXIST_BLUE" ]; then
	echo "blue is available"
	docker run -it --name ${DOCKER_APP_NAME}-blue -v $(pwd):/deploy/node-app -p 4001:4000 --network=clroot node-app 
	sleep 10
	docker rm -f ${DOCKER_APP_NAME}-green
else
	echo "green is available"
	docker run -it --name ${DOCKER_APP_NAME}-green -v $(pwd):/deploy/node-app -p 4002:4000 --network=clroot node-app 
	sleep 10
	docker rm -f ${DOCKER_APP_NAME}-blue
fi
