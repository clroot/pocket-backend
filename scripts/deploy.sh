#!/bin/bash
DOCKER_APP_NAME=pocket-backend

EXIST_BLUE=$(docker ps | grep ${DOCKER_APP_NAME}-blue)

if [ -z "$EXIST_BLUE" ]; then
	echo "blue is available"
	docker run -d --name ${DOCKER_APP_NAME}-blue -v ~/app/pocket/backend:/deploy/node-app -p 4001:4000 --network=clroot clroot/node-app:1 
	sleep 10
	EXIST_GREEN=$(docker ps | grep ${DOCKER_APP_NAME}-green)
	if [ "$EXIST_GREEN" ]; then
		echo "green is running. stoping green...."
		docker rm -f ${DOCKER_APP_NAME}-green
	fi
else
	echo "green is available"
	docker run -d --name ${DOCKER_APP_NAME}-green -v ~/app/pocket/backend:/deploy/node-app -p 4002:4000 --network=clroot clroot/node-app:1 
	sleep 10
	EXIST_BLUE=$(docker ps | grep ${DOCKER_APP_NAME}-blue)
	if [ "$EXIST_BLUE" ]; then
		echo "blue is running. stoping blue...."
		docker rm -f ${DOCKER_APP_NAME}-blue
	fi
fi
