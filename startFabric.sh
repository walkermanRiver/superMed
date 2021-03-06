#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
LANGUAGE=${1:-"golang"}
# CC_SRC_PATH=github.com/superMed
CC_SRC_PATH=github.com/hyperledger/fabric/examples/chaincode/
#CC_SRC_PATH=$(cd `dirname $0`; pwd)
# CC_SRC_PATH=$(dirname $0)/chainCode/go
# CC_SRC_PATH=chainCode/go
# echo $CC_SRC_PATH

# if [ "$LANGUAGE" = "node" -o "$LANGUAGE" = "NODE" ]; then
# 	CC_SRC_PATH=/opt/gopath/src/github.com/fabcar/node
# fi

# clean the keystore
rm -rf ./hfc-key-store

# launch network; create channel and join peer to channel
cd ./artifacts/network/
./start_basic.sh

# Now launch the CLI container in order to install, instantiate chaincode
# and prime the ledger with our 10 cars
docker-compose -f ./docker-compose.yml up -d cli

docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n superMed -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n superMed -l "$LANGUAGE" -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 10
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n superMed -c '{"function":"initLedger","Args":[""]}'

cd -
node ./artifacts/network/enrollAdmin.js
node ./artifacts/network/registerUser.js


# ./artifacts/network/initializeData.sh

printf "\nTotal setup execution time : $(($(date +%s) - starttime)) secs ...\n\n\n"
printf "\nExecute npm run initData to initlize data  ...\n\n\n"
printf "\nExecite the service with the url http://localhost:4000/XXX  ...\n\n\n"
npm start

# node ./bin/www
