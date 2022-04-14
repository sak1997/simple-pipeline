#!/bin/bash
set -e

rm -rf testing/mutations
rm -rf testing/image_snapshots
rm -rf testing/html_snapshots

mkdir testing/mutations
mkdir testing/image_snapshots
mkdir testing/html_snapshots

npm install --prefix testing

npm link --prefix testing
