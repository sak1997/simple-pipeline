wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt --fix-broken install -y

sudo apt install nodejs npm -y
sudo npm install forever -g
npm init --yes
npm install esprima
npm install escodegen
npm install chalk@4.1.0
npm install puppeteer
npm install
npm link

