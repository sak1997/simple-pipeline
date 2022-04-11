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
