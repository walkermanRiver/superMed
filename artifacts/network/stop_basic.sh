#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error, print all commands.
set -ev

# Shut down the Docker containers that might be currently running.
docker-compose -f docker-compose.yml stop

docker rm -f $(docker ps -aq)

docker network prune

docker rmi dev-peer0.org1.example.com-supermed-1.0-0e8c5a93960fe9b64e49952c150e7e8f51a39f38a70205f1d5bc446535c7b0bc