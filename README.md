# Pipeline Tool 

### A pipeline tool to automate builds.
### Milestone 3 - Deployment

## Contents

| Topic | Location |
|-|-|
|Tasks | [click here](#tasks-and-progress) |
|Setup Instructions| [click here](#setup-instructions)|
|Commands| [Click here](#commands)|
|Results| [click here](#results)|
|Experiences | [click here](#experiences)|
|Challenges | [click here](#challenges)|
|Screencast | [click here](#screencasts)|


## Tasks and Progress

| Task | Progress | Challenges
|-|-|-|
| Generate snapshots | Completed - see testing/snapshot.js for HTML snapshot code | Compare and contrast between HTML and image snapshots
| Mutation operators |  Done - please see testing/mutation.js for the implementation | Understanding the structure of ASTs for various operators
| Test harness | Done - please see commands/build.js for implementation |
| Mutation coverage | Done |Ignoring whitespace and comments in HTML snapshots | Handling compliation failures
| Build specification | Done - available in the build.yml in this repo
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
          USER_NAME=<your username for the Personal access token>
          TOKEN=<your personal access token>
          DIGITAL_OCEAN_TOKEN=<your personal access token for Digital Ocean>
          PUB_KEY_PATH=<path to public key>
          PVT_KEY_PATH=<path to private key>  

     </details>

     <details>
      <summary>M1 Mac</summary>
        <p>

          VM_NAME='vm1'
          USER_NAME=<your username for the Personal access token>
          TOKEN=<your personal access token for GitHub>
          DIGITAL_OCEAN_TOKEN=<your personal access token for Digital Ocean>
          PUB_KEY_PATH=<path to public key>
          PVT_KEY_PATH=<path to private key>

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

## Commands
  - ```pipeline init ```
    * Creates a vm in the host machine.
          
  - ```pipeline build <job-name> <path to build yml file>```
    * Executs the scripts in setup and the spcified job from the build yml file in the vm. 
  - ```pipeline prod up```
    * Deletes all the existing droplets and creates new blue and green droplets.
    * Start the loadbalancer. Restart if the loadbalancer is already running.
  - ```pipeline deploy inatance <job-name> <path to build yml file>```
    * Create a new droplet.
    * Executs the scripts in setup and the spcified job from the build yml file in the new droplet.
    * Executes the following when the deployment is completed.
      + Delete the current blue droplet.
      + Change the current green droplet to blue.
      + Add the newly created droplet as green.
          
## Results


## Experiences

We compared and contrasted blue-green vs canary deployments, and decided to use blue-green. We also thought about using digital ocean vs other providers but elected to use Digital Ocean due to convenience, simplicity and our previous experiences working with it. 

Additionally, we wrote a proxy in node js that would keep running and redirect requests to the currently running green server. This proxy refreshes its green server using the instance.properties file every few seconds to ensure that it routes requests to the current green server. 


## Challenges

We faced challenges in understanding how to set up Digital Ocean droplets with SSH enabled by default, and after going through their documentation, we found the options required to do this.

We also had to understand how we could set up a proxy server that serve requests to the current server, whatever it may be, and refresh this every few seconds to ensure the current green server is always being used for incoming requests. 

For this, we found that we could have the proxy server (lib/lb.js) could read the instance.properties file every few seconds and update itself should the green server be changed.


## Screencasts

The screencast can be found at the below link:


## Team Members

| Name | Unity ID |
| ------------- |:-------------:|
|Ashok Kumar Selvam | aselvam |
|Sri Athithya Kruth Babu | sbabu |
|Smayana Pidugu | spidugu |
