#!/bin/bash
set -e
set -x

cd testing
cp mutations/mutation$1.js ../$2/$3.js

echo "starting forever for mutation"
cd ../$2
forever start index.js
sleep 5s
