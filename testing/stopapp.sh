#!/bin/bash
set -e
set -x

echo "stopping forever for mutation"
cd $1
forever stop index.js
cd ..
