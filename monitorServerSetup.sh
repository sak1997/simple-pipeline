#!/bin/bash
set -e
set -x

apt-get update
apt-get install npm -y
npm install forever -g

sudo apt-get install redis-server -y
sudo service redis-server status
sleep 10s

echo bind 0.0.0.0 >> /etc/redis/redis.conf
sudo service redis-server restart
sudo service redis-server status

cd ~/dashboard && npm install
cd ~/dashboard && forever start bin/www

echo "Server setup complete!"