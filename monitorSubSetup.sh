#!/bin/bash
set -e
set -x

apt-get update
apt-get install npm -y
npm install forever -g
cd ~/agent 
forever start index.js $1
echo Monitoring Subscriber Setup Completed!