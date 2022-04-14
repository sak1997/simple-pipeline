#!/bin/bash
set -e
set -x
# wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# sudo dpkg -i google-chrome-stable_current_amd64.deb

# sudo apt-get install -y build-essential
# sudo apt --fix-broken install -y


# sudo apt remove flash-kernel -y
# sudo apt remove u-boot-rpi:arm64 -y

sudo apt install chromium-browser -y
# sudo apt --fix-broken install -y

sudo apt-get install -y libatk1.0-0
sudo apt-get install -y libatk-bridge2.0-0
sudo apt-get install -y libcups2
sudo apt-get install -y libgtk-3-0
sudo apt-get install -y libgbm1

# sudo apt-get install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
sudo apt install nodejs -y
# sudo apt --fix-broken install -y

sudo apt install npm -y
# sudo apt --fix-broken install -y

sudo npm install forever -g
# npm init --yes --prefix testing

# sudo npm install pm2@latest -g
