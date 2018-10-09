#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# launch network; create channel and join peer to channel
cd ./artifacts/network/
./stop_basic.sh
