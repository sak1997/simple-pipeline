ECHO is on.
sudo apt-get update 
sudo apt-get install -y maven 
sudo apt-get install -y openjdk-11-jdk 
export DEBIAN_FRONTEND=noninteractive 
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password password rootpw' 
sudo debconf-set-selections <<< 'mysql-server mysql-server/root_password_again password rootpw' 
sudo mkdir -p /etc/mysql/conf.d && sudo apt-key adv --keyserver pgp.mit.edu --recv-keys 5072E1F5 
echo deb http://repo.mysql.com/apt/ubuntu/ trusty mysql-8.0 | sudo tee -a /etc/apt/sources.list.d/mysql.list 
sudo apt-get install -y mysql-server 
