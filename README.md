# Pipeline Tool 

### A pipeline tool to automate builds.

## Tasks and Progress

| Task | Progress | Challenges
| ------------- |:-------------:| ---- |
| Automatically provision and configure a build server | Complete on M1 and Windows environments | Agreeing on parameters for the .env file  
| Create a build job specification |  Not started | Understanding how design will influence the build environment configuration.
| Checkpoint Report | Done | None
| Automatically configure a build environment for given build job specification | Not started
| Milestone Report | Not started
| Screencast | Not started

So far, we have completed most of the task to Automatically provision and configure a build server on both M1 and Windows environments. 

This first task was done in two separate branches for M1 and Windows, and then merged. This is mostly completed, apart from slight modifications later depending on any additions we deem necessary going forward.

We have also completed the checkpoint report for this milestone.

## Experiences

We had to understand how the same workflow to get a VM ready and deployed would be different in different OS architectures - M1 vs others, since we are using basicvm in M1 machines and Virtual Box otherwise. 

Understanding how the skeleton code provided differentiated between system helpful, and we used that to write our own code.

## Challenges

- Understanding how to work with the .env file, and what constraints to enforce - like IP, VM name etc

- Understanding how YAML design will influence the build environment configuration.

## Work Remaining

We need to complete our work on the second task, which is the job specification before moving on the third and largest task, Automatically configure a build environment for given build job specification. 

After this, we still have to work on a screencast, write the milestone report and test our work.

## Team Members

| Task | Progress |
| ------------- |:-------------:|
|Ashok Kumar Selvam | aselvam |
|Sri Athithya Kruth Babu | sbabu |
|Smayana Pidugu | spidugu |
