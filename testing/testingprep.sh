#!/bin/bash
set -e
# wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# sudo dpkg -i google-chrome-stable_current_amd64.deb

# sudo apt-get install -y build-essential
# sudo apt --fix-broken install -y

rm -rf testing/mutations
rm -rf testing/image_snapshots
rm -rf testing/html_snapshots

mkdir testing/mutations
mkdir testing/image_snapshots
mkdir testing/html_snapshots


sudo apt remove flash-kernel -y
# sudo apt remove u-boot-rpi:arm64 -y

sudo apt install chromium-browser -y
# sudo apt --fix-broken install -y

sudo apt install nodejs -y
# sudo apt --fix-broken install -y

sudo apt install npm -y
# sudo apt --fix-broken install -y

sudo npm install forever -g
# npm init --yes --prefix testing

npm install --prefix testing

npm link --prefix testing
