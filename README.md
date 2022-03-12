# Pipeline Tool 

### A pipeline tool to automate builds.

## Contents

| Topic | Location | 
| ------------- |:-------------:|
|Tasks | Please see below [here](#tasks-and-progress) or [screencasts](#screencasts). |
|Sample .env file | Please see below [here](#sample-env-file)
|Experiences | Please see below [here](#experiences)|
|Challenges | Please see below [here](#challenges)|
|Screencast | Please see below [here](#screencasts)|


## Tasks and Progress

| Task | Progress | Challenges
| ------------- |:-------------:| ---- |
| Automatically provision and configure a build server | Complete on M1 and Windows environments | Agreeing on parameters for the .env file  
| Create a build job specification |  Done | Understanding how design will influence the build environment configuration.
| Checkpoint Report | Done | None
| Automatically configure a build environment for given build job specification |In Progress | Multiple(Please see Issues below for more)
| Milestone Report | In Progress
| Screencast | In Progress

The automatic provisioning and configuration of the build server has been done for both windows and M1 environments. 

We have designed a build.yml file to cover the steps involved in the construction of the environment for iTrust. 

Finally, we have also parsed, interpreted and run the commands from the build.yml file in the new VM to set up the environment and build iTrust. 

## Sample env File

```
IP=192.168.10.112 <Only for Windows, MAC does need IP specified>
VM_NAME=pipeline-vm
unityid=sbabu
pat=<your personal access token>
```

## Experiences

We had to understand how the same workflow to get a VM ready and deployed would be different in different OS architectures - M1 vs others, since we are using basicvm in M1 machines and Virtual Box otherwise. 

Understanding how the skeleton code provided differentiated between system was helpful, and we used that to write our own code. 

We also had to understand how SSH would work inside the repository given that the entire process had to happen without user intervention. Personal Access Tokens proved to be quite helpful in this case.

## Challenges

- Understanding how to work with the .env file, and what constraints to enforce - like IP, VM name etc

- Understanding how YAML design will influence the build environment configuration.

- Working with SSH on M1 and Windows environments

- Issues with CLRF and LF line endings on Windows and M1 Mac environments.

- Issues with single and double quotes when running Linux commands through SSH on the VM from the host.

## Screencasts

The screencast can be found at the below link:
  https://drive.google.com/file/d/1k1-PyhGEiAVeXt9EPs7t8jzq7LYEA5Ma/view?usp=sharing

## Team Members

| Name | Unity ID |
| ------------- |:-------------:|
|Ashok Kumar Selvam | aselvam |
|Sri Athithya Kruth Babu | sbabu |
|Smayana Pidugu | spidugu |
