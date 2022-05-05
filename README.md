# Pipeline Tool - F0 [Unity ID: sbabu]

Student Name: *Sri Athithya Kruth Babu*

Unity ID: *_**sbabu**_*

*Developed and tested in **Windows environment** - not tested in Mac or M1 environments.*

### A pipeline tool to automate builds.
### F0 - monitoring feature and 2 jobs

## Contents

| Topic | Location |
|-|-|
|Tasks | [Click here](#tasks-and-progress) |
|Commands| [Click here](#commands)|
|Deployment Job #1 | [Click here](#deployment-job-1---calcyml)|
|Deployment Job #2 | [Click here](#deployment-job-2---blogyml)|
|New Feature - Monitoring|[Click here](#new-feature-monitoring-for-blue-green)|
|Experiences | [click here](#experiences)|
|Challenges | [click here](#challenges)|
|Screencast | [click here](#screencasts)|


## Tasks and Progress

| Task | Progress | Challenges
|-|-|-|
| Deployment Job #1 | Done | 
| Deployment Job #2 |  Done  | update deployment settings for django web application
| New Feature | Done - Implemented monitoring and metrics | Understand how metrics, sockets, monitoring design works
| Screencast and Milestone Report | Please see below for the screencast

Please see below for more about the challenges and experiences in the corresponding sections.
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

- F0-sbabu has been written and tested only on a **Windows machine**. 
- Digital Ocean droplets created have their IP and droplet ID stored in the instance.properties in the project's main directory.
- There is a load balancer (lib/lb.js) running that changes the IP to the current green machine IP. The load balancer can be accessesed by using localhost:3090 instead of the droplet IP. After typing it in, follow it up with the rest of the URL as you would when using the normal IP.

```
http://167.99.115.34:8080/iTrust2/login
```
can be called by typing into your browser:
```
http://localhost:3090/iTrust2/login
```

- Sometimes, we see issues with the Digital Ocean droplets having network issues and failing, and also some latency in droplet creation - this is intermittent and in case the deploy stops due to this or a related reason, we recommend running pipeline prod up and pipeline deploy once more. 

## Commands
  - ```pipeline init ```
    * Creates a vm in the host machine.
          
  - ```pipeline build <job-name> <path to build yml file>```
    * Executs the scripts in setup and the spcified job from the build yml file in the vm. 

  - ```pipeline prod up```
    * Deletes all the existing droplets and creates new blue and green droplets.
    * Start the loadbalancer. Restart if the loadbalancer is already running.

  - ```pipeline deploy instance <job-name> <path to build yml file>```
    * Create a new droplet.
    * Executs the scripts in setup and the spcified job from the build yml file in the new droplet.
    * Executes the following when the deployment is completed.
      + Delete the current blue droplet.
      + Change the current green droplet to blue.
      + Add the newly created droplet as green.

  - ```pipeline monitor```
    * Sets up monitoring for a blue-green deployment
    * Creates a new droplet for monitoring server, and the monitoring dashboard is available at <new droplet IP>:8080
          
## Deployment Job #1 - calc.yml

Please see the calc.yml file in the project main directory or below. This sets up a calculator web application in a droplet, that can be accessed by going to the < new droplet IP>:8080 or http://localhost:3090 [load balancer proxy]

Commands to run (Please run in the order here):

```
pipeline init
pipeline build build calc.yml
pipeline build test calc.yml
pipeline prod up
pipeline deploy instance deploy calc.yml
pipeline monitor
```

Note:

```pipeline build build calc.yml``` performs the job with name 'build' in calc.yml. This performs a build of the application.

```pipeline build test calc.yml``` performs the job with name 'test' in calc.yml. This is a testing phase in the job.

### Job - calc.yml

```
setup:
  - sudo systemctl disable apt-daily-upgrade.timer
  - sudo systemctl mask apt-daily-upgrade.service
  - sudo systemctl disable apt-daily.timer
  - sudo systemctl mask apt-daily.service
  - sudo timedatectl set-ntp off
  - sudo timedatectl set-ntp on
  - sleep 1
  - sudo apt-get update
  - sudo apt update
  - sudo apt remove flash-kernel -y
  - sudo apt-get install npm -y
jobs:
  - name: build
    steps:
      - name: download prj
        run: git clone github.com/pnicolli/demo-calculator
      - name: run npm install
        run: npm install --prefix demo-calculator/
      - name: build the project
        run: npm run build --prefix demo-calculator/ > npmbuild.txt
      - name: store build output
        shared:  ~/demo-calculator/build
  - name: test
    steps:
      - name: run tests
        run: cd demo-calculator/ && npm test -- --coverage > ../npmtest.txt
  - name: deploy
    steps:
      - name: install serve
        run: npm install -g serve
      - name: run 
        backgroundRun: serve -s output/build -l 8080
  - name: monitor
    steps:
      - name: use this URL for monitoring
        run: /

```

Note:

```pipeline build build calc.yml``` performs the job with name 'build' in calc.yml. This performs a build of the application.

```pipeline build test calc.yml``` performs the job with name 'test' in calc.yml. This is a testing phase in the job.

## Deployment Job #2 - blog.yml

Please see the calc.yml file in the project main directory or below. This sets up a blog web application written in python using django in a droplet, that can be accessed by going to the < new droplet IP>:8080/admin or http://localhost:3090/admin [load balancer proxy]

Commands to run (Please run in the order here):

```
pipeline init
pipeline build build blog.yml
pipeline build test blog.yml
pipeline prod up
pipeline deploy instance deploy blog.yml
pipeline monitor
```
### Job - blog.yml
```
setup:
  - sudo systemctl disable apt-daily-upgrade.timer
  - sudo systemctl mask apt-daily-upgrade.service
  - sudo systemctl disable apt-daily.timer
  - sudo systemctl mask apt-daily.service
  - sudo timedatectl set-ntp off
  - sudo timedatectl set-ntp on
  - sleep 1
  - sudo apt-get update
  - sudo apt update
  - sudo apt remove flash-kernel -y
  - sudo apt install python3 -y
  - sudo apt install python3-pip -y
  - sudo apt install docker.io -y
jobs:
  - name: build
    steps:
      - name: download prj
        run: git clone github.com/reljicd/django-blog.git
      - name: install django and other requirements
        run: pip install -r django-blog/requirements.txt 
      - name: edit settings.py
        scriptRun: sed -i "s/ALLOWED_HOSTS = \[\]/ALLOWED_HOSTS = \[\'"*"\'\]/"  django-blog/mysite/settings.py
      - name: migrate for django
        run: python3 django-blog/manage.py migrate
      - name: load sample data
        run: python3 django-blog/manage.py loaddata users posts comments
      - name: build docker image
        run: sudo docker build -t reljicd/django-blognew -f django-blog/docker/Dockerfile django-blog/ > dockerbuildoutput.txt
      - name: save docker image as tar
        run: sudo docker save -o ~/dockerimage.tar reljicd/django-blognew
      - name: store build output
        shared: ~/dockerimage.tar
  - name: test
    steps:
      - name: run tests after build
        run: python3 django-blog/manage.py test blog > blog-tests.txt
  - name: deploy
    steps:
      - name: save docker image from tar
        run: docker load -i output/dockerimage.tar
      - name: run docker image
        backgroundRun: docker run --rm -i -p 8080:8000 reljicd/django-blognew
  - name: monitor
    steps:
      - name: use this URL for monitoring
        run: /admin

```

## New Feature: Monitoring for Blue-Green

### Command: pipeline monitor

The new feature implemented in F0-sbabu is a monitoring feature for a blue-green deployment. This feature can be run with the below command:

```
pipeline monitor <monitor job in .yml file> <.yml file location>
```

This command is supposed to be run only after the ```pipeline deploy instance``` command has completed running. The command sets up a monitoring server (droplet on Digital Ocean) and its IP is saved in the ```instance.properties``` files in the project home directory with the name ```MONITOR_IP```. The monitoring dashboard can be accessed through by going to ```MONITOR_IP:8080``` on a browser. 

This command expects a job in the .yml file that look something like the below example. The job expects the endpoint for the HTTP request [localhost:8000/<endpoint>] in the run command:

```
  - name: monitor
    steps:
      - name: use this URL for monitoring
        run: /admin <or the URL endpoint to test>
```

## Experiences

Understanding how sockets worked was also an enjoyable experience, and setting up monitoring was very interesting. I had to understand how the different parts of the monitoring architecture Dr. Parnin explained in his monitoring workshop worked together, and it was fun to work on this. 

It was also extremely engaging to understand how different web applications can be deployed, and how these deployments can work with the pipeline I worked on. Understanding how my pipeline interacted with these build jobs and designing these build jobs to work with my pipeline proved to be enjoyable, and made undersand how the pipeline design can be improved. For instance, we run some of the commands directly through ssh. Some of this can be made simpler by putting some of the commands that would work inside a bash script. 

I also had to understand how some of the metrics used in the monitoring feature are computed, and which ones can make sense in different situations to understand how the system is doing, how performant it is etc. 

## Challenges

One of the biggest challenges was writing a build job for a django application(blog.yml). This application's django deployment configuration required updating a line of code in the settings.py file to ```SET_ALLOWED_HOSTS = ['*']```. Writing a sed command to correctly update this that would work using the existing pipeline was interesting.

Finding an application that satisfied the requirements was a challenge all by itself, and while there were some apps available on github, many lacked test suites, thus making them unviable choices for this purpose.

Another challenge I faced was getting the IPs of the monitoring server and the blue and green servers to the correct files in the code for the monitoring feature. I achieved this by having them read the corresponding droplet IPs from the ```instance.properties``` file. 

## Screencasts

The screencast can be found at the below link:

calc.yml screencast: (needs ncsu.edu drive access)

https://drive.google.com/file/d/1Pq88o55YWSdJhs1bQz34OM7pf83_r2og/view?usp=sharing

blog.yml screencast: (needs ncsu.edu drive access)

https://drive.google.com/file/d/1XytwgaBVsfk6h2evNg4w-nQs4aYRZfU_/view?usp=sharing

## Student Information
Student Name: Sri Athithya Kruth Babu

Unity ID: sbabu
