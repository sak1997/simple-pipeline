# Pipeline Tool 

### A pipeline tool to automate builds.
### Milestone 2 - Testing and Analysis

## Contents

| Topic | Location |
|-|-|
|Tasks | [click here](#tasks-and-progress) |
|Instructions| [click here](#instructions)|
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

The automatic provisioning and configuration of the build server has been done for both windows and M1 environments.

We have designed a build.yml file to cover the steps involved in the construction of the environment for iTrust.

Finally, we have also parsed, interpreted and run the commands from the build.yml file in the new VM to set up the environment and build iTrust.

## Instructions


### Sample env File

### Windows

```
IP=192.168.10.112
VM_NAME=pipeline-vm
USER_NAME=<your username for the Personal access token>
TOKEN=<your personal access token>
```

#### M1 Mac

```
VM_NAME='vm1'
USER_NAME=<your username for the Personal access token>
TOKEN=<your personal access token>
```

#### Notes

- Mutations are saved inside the VM in the testing/mutations directory on the VM
- Snapshots are saved in the testing/HTML_snapshots directory on the VM

## Results

### M1 Mac

#### Build for 10 Iterations
<details>
   <summary>Output</summary>
   <p>
  
   ```
    TODO: Output       
   ```
  </p>
</details>

<details>
   <summary>Mutation Logs</summary>
   <p>
  
   ```
    TODO: Mutation Logs       
     
   ```
  </p>
</details>

<details>
   <summary>Results Logs</summary>
   <p>
  
   ```
    TODO: Results Logs      
   ```
  </p>
</details>


#### Build for 1000 Iterations

<details>
   <summary>Output</summary>
   <p>
  
   ```
    TODO: Output       
   ```
  </p>
</details>

<details>
   <summary>Mutation Logs</summary>
   <p>
  
   ```
    TODO: Mutation Logs       
     
   ```
  </p>
</details>

<details>
   <summary>Results Logs</summary>
   <p>
  
   ```
    TODO: Results Logs      
   ```
  </p>
</details>


### Windows

#### Build for 10 Iterations
<details>
   <summary>Output</summary>
   <p>
  
   ```
    TODO: Output       
   ```
  </p>
</details>

<details>
   <summary>Mutation Logs</summary>
   <p>
  
   ```
    TODO: Mutation Logs       
     
   ```
  </p>
</details>

<details>
   <summary>Results Logs</summary>
   <p>
  
   ```
    TODO: Results Logs      
   ```
  </p>
</details>


#### Build for 1000 Iterations

<details>
   <summary>Output</summary>
   <p>
  
   ```
    TODO: Output       
   ```
  </p>
</details>

<details>
   <summary>Mutation Logs</summary>
   <p>
  
   ```
    TODO: Mutation Logs       
     
   ```
  </p>
</details>

<details>
   <summary>Results Logs</summary>
   <p>
  
   ```
    TODO: Results Logs      
   ```
  </p>
</details>

## Experiences


We discussed how to build on top of the already-existing code in an efficient fashion, and also considered different possible formats in the .yml file. Additionally, a few setup operations for the testing were different on Windows and M1, so we created different functions to accommodate that. 

We had to consider various trade-offs over the course of this milestone such as HTML vs image for snapshots - which ones would be easier to process, would differences be captured correctly etc and arrived at the choice to use HTML snapshots.   

Building a test harness to put everything together was a very interesting exercise, and we experienced quite a bit of confusion between operating systems there, and after some iterations of work, made it system-agnostic. We also had to work around any compilation errors in the mutated code that would make it impossible to take a snapshot and factor that into the mutation coverage calculations. 


## Challenges

- Working with HTML vs Image-based snapshots, and the question of which would better capture the differences caused by the mutations.

- Understanding the structure and method to alter the AST in escodegen for some operators was harder than others - control flow and clone return operators in particular were quite challenging due to the complexity of the AST.

- Getting the app running each time to take snapshots - we achieved this through the forever npm module

- Snapshot differencing - finding an effective way to ignore useless parts of the HTML snapshots like unneeded whitespace, comments etc which do not contribute to mutation coverage

- Issues with CLRF and LF line endings on Windows and M1 Mac environments.

- Issues with single and double quotes when running Linux commands through SSH on the VM from the host.

## Screencasts

The screencast can be found at the below link:


## Team Members

| Name | Unity ID |
| ------------- |:-------------:|
|Ashok Kumar Selvam | aselvam |
|Sri Athithya Kruth Babu | sbabu |
|Smayana Pidugu | spidugu |
