# Pipeline Tool 

### A pipeline tool to automate builds.
### Final Exam

| | |
|-|-|
| **Name** | Smayana Pidugu |
| **Unity ID** | spidugu |
| **Email** | spidugu@ncsu.edu |
| **Development Env** | M1 MAC |

Note: The new features are not tested on Windows or Intel Mac.


## Contents

| Topic | Location |
|-|-|
|Tasks | [Click here](#tasks-and-progress) |
|Commands| [Click here](#commands)|
|Deployment Job #1 | [Click here](#deployment-job-1---calcyml)|
|Deployment Job #2 | [Click here](#deployment-job-2---blogyml)|
|New Feature - Static Analysis|[Click here](#new-feature-monitoring-for-blue-green)|
|Screencast | [click here](#screencasts)|


## Tasks and Progress

| Task | Progress | Challenges
|-|-|-|
| Deployment Job #1 | Done | 
| Deployment Job #2 |  Done  | 
| New Feature | Done - Implemented Static Analysis|
| Screencast and Milestone Report | Please see below for the screencast

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
     </details>

#### Notes

- Digital Ocean droplets created have their IP and droplet ID stored in the instance.properties in the project's main directory.

## Commands
  - ```pipeline init ```
    * Creates a vm in the host machine.
          
  - ```pipeline build <job-name> <path to build yml file>```
    * Executs the scripts in setup and the spcified job from the build yml file in the vm. 

  - ```pipeline prod up```
    * Deletes all the existing droplets and creates a droplets.

  - ```pipeline deploy instance <job-name> <path to build yml file>```
    * Create a new droplet.
    * Executes the scripts in setup and the spcified job from the build yml file in the new droplet.
  
  - ```pipeline analyze <job-name> <path to build yml file>```
    * Performs static analysis on Javascript file whose path is mentioned in yml file.
          
## Deployment Job #1 - leonBuild.yml

Please see the leonBuild.yml file in the project main directory or below. Leon is an open-source personal assistant developed in NodeJS. This pipeline deployes in localVM  and can be accessed at < new droplet IP>:1337/

Commands to run (Please run in the order here):

```
pipeline init
pipeline build build leonBuild.yml
pipeline build run leonBuild.yml
pipeline build test leonBuild.yml
pipeline analyze analyze leonBuild.yml
```

Note:

```pipeline build build leonBuild.yml``` performs the job with name 'build' in leonBuild.yml. This performs a build of the application.
           
```pipeline build run leonBuild.yml``` performs the job with name 'run' in leonBuild.yml. This deploys the application in localVM at port 1337

```pipeline build test leonBuild.yml``` performs the job with name 'test' in leonBuild.yml. This is a testing phase in the job.

### Job - leonBuild.yml

```
setup:
  - sudo apt update
  - sudo apt-get update
  - sleep 30
  - sudo apt autoremove -y flash-kernel
  - curl -sL https://deb.nodesource.com/setup_16.x | sudo bash -
  - sudo apt-get install -y nodejs
  - sudo npm install --global @leon-ai/cli
  - sudo leon create birth --yes
jobs:
  - name: build
    steps:
      - name: clone repo
        run: git clone github.com/leon-ai/leon.git -b master
      - name: install
        run: cd ~/leon && npm install 
      - name: build
        run: cd ~/leon && sudo npm run build 
  - name: test
    steps:
      - name: test
        run: cd ~/leon && sudo npm run test:unit
  - name: run
    steps:
      - name: run
        run: cd ~/leon && sudo npm start
  - name: analyze
    steps:
      - name: static analysis
        run:  ~/leon/scripts/train.js

```


## Deployment Job #2 - petclinicBuild.yml

Please see the petclinicBuild.yml file in the project main directory or below. This sets up a web application written in java using openJDK in a droplet, that can be accessed by going to the < localVM IP>:8080/

Commands to run (Please run in the order here):

```
pipeline init
pipeline build build petclinicBuild.yml
pipeline build test petclinicBuild.yml
pipeline prod up
pipeline deploy instance deploy petclinicBuild.yml
```
###Job 2 - petclinicBuild.yml
```
setup:
  - sleep 1
  - sudo apt-get update
  - sleep 50
  - sudo apt autoremove -y flash-kernel
  - {package: maven, version: 3.6.3}
  - {package: openjdk-11-jdk, version: 11.0.14}
jobs:
  - name: build
    steps:
      - name: download prj
        run: git clone github.com/spring-projects/spring-petclinic.git
      - name: create application.yml
        run: cd ~/spring-petclinic && bash ./mvnw package
      - name: copy artifact
        shared: spring-petclinic/target/spring-petclinic-2.6.0-SNAPSHOT.jar
  - name: deploy
    steps:
      - name: run in cloud
        run: java -jar output/spring-petclinic-2.6.0-SNAPSHOT.jar
  - name: test
    steps:
      - name: unit test
        run: cd ~/spring-petclinic && mvn test
```

## New Feature: Static Analysis

### Command: pipeline analyze <job-name> <path to build yml file>

This command is supposed to be run only after the ```pipeline build ``` command has completed running. The command performs static analysis on JS file mentioned in the job in yml file. It copies file from project repo of localVM to host machine and analysis the Javascript file for packages, literals, function parameters, cyclomatic complexity and Halstead value.  
           
```
  - name: analyse
    steps:
      - name: JS file name
        run: <path_to_JS_file>
```

## Screencasts

The screencast can be found at the below link: (needs ncsu.edu drive access)

https://drive.google.com/file/d/1dKn7dmMUgwz_Xurg3eFJKWeha3JyjsB6/view?usp=sharing
