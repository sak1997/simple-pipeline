#!/bin/bash

# set -e

cp $1/marqdown.js marqdown.js

echo "starting forever for baseline"
cd $1
forever start index.js
sleep 5s

cd ../testing
node screenshot.js $2 snapshot_orig_$3
echo "taking snapshot for baseline"

cd ../$1
forever stop index.js
echo "stopping forever for baseline"
