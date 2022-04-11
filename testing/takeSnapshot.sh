#!/bin/bash

set -e

for ((i = 1 ; i <= $1 ; i++)) do

cd testing
cp mutations/mutation$1.js ../$3/marqdown.js

echo "starting forever for mutation"
cd ../$3
forever start index.js
sleep 5s

cd ../testing
node screenshot.js $2 snapshot_$4_$i
echo "taking snapshot for mutation"


echo "stopping forever for mutation"
cd ../$3
forever stop index.js
cd ..
done
