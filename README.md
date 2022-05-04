# Pipeline Tool 

### A pipeline tool to automate builds.
### Final Exam

| | |
|-|-|
| **Name** | Ashok Kumar Selvam |
| **Unity ID** | aselvam |
| **Email** | aselvam@ncsu.edu |
| **Development Env** | M1 MAC |

Note: The new features are not tested on Windows or Intel Mac.



## Contents

|S.No | Topic |
|-|-|
|1|[New Features](#new-features)|
|2|[Setup Instructions](#setup-instructions)|
|3|[Build YML Specs](#build-yml-specs)|
|4|[Commands](#commands)|
|5|[Apps Deployed](#apps-deployed)|
|6|[Experiences](#experiences)|
|7|[Challenges](#challenges)|
|8|[Screencast](#screencasts)|


## New Features
  - Chaos Command:
    * Added a new command which can be executed to start one of the random chaos scripts added in the tool.
    *  ```pipeline chaos [--ip <ip of the server>] [-c <no of times to run chaos>] [-s <server type (BLUE/GREEN)>] [-t <type of chaos>]``` 
    * Refer [Commands](#commands) section for more details.
  - Server Pool:
    * The application is now deployed in a pool of blue/green servers instead of one blue and one green server.
    * The pool size must be added in the .env file. The default pool size is 1.
    * During the deployment process, one by one green servers are changed to blue and new green server is added to the pool when its ready.
    * The load balancer uses round robbin to decide which server shoud be used at any point in time.
  

## Setup Instructions

  1) Create an account in [Digital Ocean](https://www.digitalocean.com).
  2) Create a public key/private key pair in the host machine.
  3) Add the public key in the Digital Ocean account.
  4) Create a .env in the repo home based on the sample given below.

     <details>
      <summary>Windows</summary>
        <p>

          IP=192.168.10.112
          VM_NAME=pipeline-vm
          USER_NAME=<your username for GitHub>
          TOKEN=<your personal access token for GitHub>
          DIGITAL_OCEAN_TOKEN=<your personal access token for Digital Ocean>
          PUB_KEY_PATH=<path to public key>
          PVT_KEY_PATH=<path to private key> 
          POOL_SIZE=<count of blue and green server pool>

     </details>

     <details>
      <summary>M1 Mac</summary>
        <p>

          VM_NAME='vm1'
          USER_NAME=<your username for GitHub>
          TOKEN=<your personal access token for GitHub>
          DIGITAL_OCEAN_TOKEN=<your personal access token for Digital Ocean>
          PUB_KEY_PATH=<path to public key>
          PVT_KEY_PATH=<path to private key>
          POOL_SIZE=<count of blue and green server pool>
     </details>

#### Notes

- Digital Ocean droplets created have their IP and droplet ID stored in the instance.properties in the project's main directory.
- There is a load balancer (lib/lb.js) running that changes the IP to the current green machine IP. The load balancer can be accessesed by using localhost:3090 instead of the droplet IP. After typing it in, follow it up with the rest of the URL as you would when using the normal IP.

```
http://167.99.115.34:8080/iTrust2/login
```
can be called by typing into your browser:
```
http://localhost:3090/iTrust2/login
```

- Sometimes, we see issues with the Digital Ocean droplets having network issues and failing - this is intermittent and in case the deploy stops due to some reason, we recommend running pipeline prod up and pipeline deploy once more. 

## Build YML Specs
  ```
  setup:
     // All the commands in this block will be executed sequentially for all the jobs and commands
     - command 1
     - command 2
     .
     .
     .
  jobs:
     // Add all the jobs here
     // Job spec for build and deploy
     - name: job1
       steps:
          // usage 1: The command in the run block will be executed
          - name: description
            run: command
          // usage 2: The command in the backgroundRun block will be executed async.
                      The command will be executed in the background of the vm.
                      The host machine will not wait for this command to be completed.
                      [Only supported in deploy command in this version]
          - name: description
            backgroundRun: command
          // usage 3: The file/directory in <path to file> will be copied to a directory (output) when the job is used in build command.
                      The content of this directory (output) will be copied to the home directory of the deploy machine (droplet) on each deploy.
                      [Only supported in build command in this version]
          - name: description
            shared: <path to file>
     // Job spec for mutation
     - name: job2
       mutation:
          url: <repo url>
          iterations: <no of iterations>
          mutationfile: <file to mutate> // marqdown.js is used by default
          snapshots:
          - <snapshot1>
          - <snapshot2>
          .
          .
              
          
  ```
          
## Commands
  - ```pipeline init ```
    * Creates a vm in the host machine.
          
  - ```pipeline build <job-name> <path to build yml file>```
    * Executs the scripts in setup and the spcified job from the build yml file in the vm. 
  - ```pipeline prod up [-p <port no>]```
    * Deletes all the existing droplets and creates new blue and green droplets.
    * Start the loadbalancer. Restart if the loadbalancer is already running.
    * The app will use the 8080 port by default. If the port option is given in the command, it will be server in the specified port number.
  - ```pipeline deploy inatance <job-name> <path to build yml file>```
    * Create a new droplet.
    * Executs the scripts in setup and the spcified job from the build yml file in the new droplet.
    * Executes the following when the deployment is completed.
      + Delete the current blue droplet.
      + Change the current green droplet to blue.
      + Add the newly created droplet as green.
  - ```pipeline chaos [--ip <ip of the server>] [-c <no of times to run chaos>] [-s <server type (BLUE/GREEN)>] [-t <type of chaos>]```
    * Executes one of the chaos scripts in the production server.
    * Options:
      + --ip: Runs chaos scripts on a specific server.
      + --count / -c: Runs specified no of chaos scripts in random.
      + --server / -s: Runs chaos scripts on a specific pool of servers.
      + --type / -t: Runs a specific chaos (chaos script name without .sh at the end).
          
## Apps Deployed
  
### Spring MVC Showcase

<details>
<summary>Build.yml</summary>
  <p>

    setup:
      - sudo apt-get update
      - sudo apt remove flash-kernel -y
      - {package: maven, version: 3.6.3}
      - {package: openjdk-8-jdk, version: 8.0.14}
      - sudo apt purge openjdk-11-* -y
    jobs:
      - name: build
        steps:
          - name: download prj
            run: git clone github.com/SpringSource/spring-mvc-showcase.git
          - name: package
            run: mvn -f spring-mvc-showcase/ package
          - name: move to shared dir
            shared: spring-mvc-showcase/target/spring-mvc-showcase.war
      - name: test
        steps:
          - name: download prj
            run: git clone github.com/SpringSource/spring-mvc-showcase.git
          - name: test
            run: mvn -f spring-mvc-showcase/ clean test
      - name: deploy
        steps:
          - run: sudo groupadd tomcat
          - run: sudo useradd -s /bin/false -g tomcat -d /opt/tomcat tomcat
          - run: curl -o /tmp/apache-tomcat-8.5.78.tar.gz https://dlcdn.apache.org/tomcat/tomcat-8/v8.5.78/bin/apache-tomcat-8.5.78.tar.gz
          - run: sudo mkdir /opt/tomcat
          - run: sudo tar xzvf /tmp/apache-tomcat-8*tar.gz -C /opt/tomcat --strip-components=1
          - run: sudo chown -R tomcat /opt/tomcat/webapps/ /opt/tomcat/work/ /opt/tomcat/temp/ /opt/tomcat/logs/
          - run: sudo chgrp -R tomcat /opt/tomcat
          - run: sudo chmod -R g+r /opt/tomcat/conf
          - run: sudo chmod g+x /opt/tomcat/conf
          - run: sudo touch /etc/systemd/system/tomcat.service
          - run: echo [Unit] > /etc/systemd/system/tomcat.service
          - run: echo Description=Apache Tomcat Web Application Container >> /etc/systemd/system/tomcat.service
          - run: echo After=network.target >> /etc/systemd/system/tomcat.service
          - run: echo [Service] >> /etc/systemd/system/tomcat.service
          - run: echo Type=forking >> /etc/systemd/system/tomcat.service
          - run: echo Environment=JAVA_HOME=/usr/lib/jvm/java-1.8.0-openjdk-amd64/jre >> /etc/systemd/system/tomcat.service
          - run: echo Environment=CATALINA_PID=/opt/tomcat/temp/tomcat.pid >> /etc/systemd/system/tomcat.service
          - run: echo Environment=CATALINA_HOME=/opt/tomcat >> /etc/systemd/system/tomcat.service
          - run: echo Environment=CATALINA_BASE=/opt/tomcat >> /etc/systemd/system/tomcat.service
          - run: echo Environment='CATALINA_OPTS=-Xms512M -Xmx1024M -server -XX:+UseParallelGC' >> /etc/systemd/system/tomcat.service
          - run: echo Environment='JAVA_OPTS=-Djava.awt.headless=true -Djava.security.egd=file:/dev/./urandom' >> /etc/systemd/system/tomcat.service
          - run: echo ExecStart=/opt/tomcat/bin/startup.sh >> /etc/systemd/system/tomcat.service
          - run: echo ExecStop=/opt/tomcat/bin/shutdown.sh >> /etc/systemd/system/tomcat.service
          - run: echo User=tomcat >> /etc/systemd/system/tomcat.service
          - run: echo Group=tomcat >> /etc/systemd/system/tomcat.service
          - run: echo UMask=0007 >> /etc/systemd/system/tomcat.service
          - run: echo RestartSec=10 >> /etc/systemd/system/tomcat.service
          - run: echo Restart=always >> /etc/systemd/system/tomcat.service
          - run: echo [Install] >> /etc/systemd/system/tomcat.service
          - run: echo WantedBy=multi-user.target >> /etc/systemd/system/tomcat.service
          - run: rm -rf /opt/tomcat/webapps/ROOT
          - run: cp output/spring-mvc-showcase.war /opt/tomcat/webapps/ROOT.war
          - run: sudo systemctl daemon-reload
          - run: sudo systemctl start tomcat
          - run: sudo ufw allow 8080

</details>

#### Commands
  - ```npm install```
  - ```npm link```
  - ```pipeline init```
  - ```pipeline build build springMVCApp.yml```
  - ```pipeline build test springMVCApp.yml```
  - ```pipeline prod up```
  - ```pipeline deploy instance deploy springMVCApp.yml```

#### Deployment URL
[http://localhost:3090/](http://localhost:3090/)
          
### React app

<details>
<summary>Build.yml</summary>
  <p>

    setup:
      - sudo apt-get update
      - sudo apt-get remove flash-kernel -y
      - sudo apt-get install nodejs -y
      - sudo apt-get install npm -y
    jobs:
      - name: build
        steps:
          - run: git clone github.com/mars/heroku-cra-node.git
          - run: npm install --prefix heroku-cra-node
          - run: mkdir -p server
          - run: cp -r heroku-cra-node/server server/
          - run: cp heroku-cra-node/package.json server/
          - run: npm install --prefix heroku-cra-node/react-ui
          - run: npm run build --prefix heroku-cra-node
          - run: mkdir -p server/react-ui
          - run: cp -r heroku-cra-node/react-ui/build server/react-ui/
          - shared: server/
      - name: test
        steps:
          - run: git clone github.com/mars/heroku-cra-node.git
          - run: npm --prefix heroku-cra-node/react-ui test -- --watchAll=false
      - name: deploy
        steps:
          - run: touch output/server/.env
          - run: npm install --prefix output/server
          - backgroundRun: node output/server/server
          - run: npm install -g serve
          - backgroundRun: serve -s output/server/react-ui/build -l 5000


</details>

#### Commands
  - ```npm install```
  - ```npm link```
  - ```pipeline init```
  - ```pipeline build build reactApp.yml```
  - ```pipeline build test reactApp.yml```
  - ```pipeline prod up -p 5000``` [Note: The server port is hard coded to 5000 in this react app so, the backend server will not work without this port option]
  - ```pipeline deploy instance deploy reactApp.yml```

#### Deployment URL
[http://localhost:3090/](http://localhost:3090/)

## Experiences
- Chaos Command:
  * I learnt a lot regarding how much stress the actual production server will undergo in real life. The various chaos scripts I used helped me understand various way in which a server can be stressed.

- Deployment:
  * In the process of searching for the application to deploy using this pipeline tool, I learnt various ways in which applications with different tech stack are deployed. 
  * I also learnt that although the tools used for deployment for different tech stack are different, in high level they use the same principle.


## Challenges
 -  In the previous version of the application, the sourse port of the application is hard coded to 8080. Since, some applications use different port, I added an option in prod up command to specify the port number.
 - Using chaos scripts when there is only one server makes it very hard to test So, I updated the tool to deploy in pool of servers instead and added a variable in the .env file to specify the POOL_SIZE.



## Screencasts

- Screencast for Spring MVC App (NCSU account required)
[![Screencast for Spring MVC App](https://media.github.ncsu.edu/user/23524/files/778aad1f-8438-4bb4-8829-164763af85ed)](https://drive.google.com/file/d/15lAQuHPRME_2ad34yGxJKgQgrD8_puXU/view?usp=sharing)
          
- Screencast for React App (NCSU account required)
[![Screencast for React App](https://media.github.ncsu.edu/user/23524/files/778aad1f-8438-4bb4-8829-164763af85ed)](https://drive.google.com/file/d/1VO6VNOhEV23wkls-NgydOY4b1TGUcF5H/view?usp=sharing)
