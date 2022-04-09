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

sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget libgbm-dev

sudo apt install nodejs -y
# sudo apt --fix-broken install -y

sudo apt install npm -y
# sudo apt --fix-broken install -y

sudo npm install forever -g
# npm init --yes --prefix testing

npm install --prefix testing

npm link --prefix testing
