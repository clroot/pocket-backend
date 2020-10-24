#!/bin/bash
DOCKER_APP_NAME=pocket-backend
REPOSITORIES=/home/ec2-user/app/pocket

EXIST_DOCKER_BRIDGE_NETWORK=$(docker network ls | grep pocket)
if [ -z "$EXIST_DOCKER_BRIDGE_NETWORK" ]; then
	echo "create network bridge driver..."
	docker network create -d bridge pocket
fi


EXIST_BLUE=$(docker ps -a | grep ${DOCKER_APP_NAME}-blue)

if [ -z "$EXIST_BLUE" ]; then
	echo "blue is available"
	docker run -d --name ${DOCKER_APP_NAME}-blue \
		-v ${REPOSITORIES}/backend:/deploy/node-app \
		-v ${REPOSITORIES}/backend/.env:/deploy/node-app/.env \
		-v ${REPOSITORIES}/frontend:/deploy/frontend/build \
		-p 4001:4000 \
		--restart=always \
		--network=pocket \
		clroot/node-app
	sleep 5

	echo "set \$service_url http://127.0.0.1:4001;" | sudo tee /etc/nginx/conf.d/pocket-url.inc 
	sudo service nginx reload
	EXIST_GREEN=$(docker ps -a | grep ${DOCKER_APP_NAME}-green)

	if [ "$EXIST_GREEN" ]; then
		echo "green is running. stoping green...."
		docker rm -f ${DOCKER_APP_NAME}-green
	fi
else
	echo "green is available"
	docker run -d --name ${DOCKER_APP_NAME}-green \
		-v ${REPOSITORIES}/backend:/deploy/node-app \
		-v ${REPOSITORIES}/backend/.env:/deploy/node-app/.env \
		-v ${REPOSITORIES}/frontend:/deploy/frontend/build \
		-p 4002:4000 \
		--restart=always \
		--network=pocket \
		clroot/node-app
	sleep 5

	echo "set \$service_url http://127.0.0.1:4002;" | sudo tee /etc/nginx/conf.d/pocket-url.inc 
	sudo service nginx reload
	EXIST_BLUE=$(docker ps -a | grep ${DOCKER_APP_NAME}-blue)

	if [ "$EXIST_BLUE" ]; then
		echo "blue is running. stoping blue...."
		docker rm -f ${DOCKER_APP_NAME}-blue
	fi
fi