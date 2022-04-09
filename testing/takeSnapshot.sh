#!/bin/bash

set -e
cp checkbox.io-micro-preview/marqdown.js marqdown.js

echo "starting forever for baseline"
cd checkbox.io-micro-preview
forever start index.js
sleep 5s

cd ../testing
node screenshot.js http://localhost:3000/survey/upload.md snapshot_orig
echo "taking snapshot for baseline"

cd ../checkbox.io-micro-preview
forever stop index.js
echo "stopping forever for baseline"

# TO DO: add all URLS in the checkpoint app here to test
# for item in [LIST]
# do
#   [COMMANDS]
# done

# for ((i = 1 ; i <= $1 ; i++)) do

cd ../testing
cp mutations/mutation1.js ../checkbox.io-micro-preview/marqdown.js

echo "starting forever for mutation"
cd ../checkbox.io-micro-preview
forever start index.js
sleep 5s

cd ../testing
node screenshot.js http://localhost:3000/survey/upload.md snapshot_1
echo "taking snapshot for mutation"

echo "stopping forever for mutation"
cd ../checkbox.io-micro-preview
forever stop index.js

# done

cd ..
cp marqdown.js checkbox.io-micro-preview/marqdown.js
