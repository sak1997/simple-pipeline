const chalk = require('chalk');
const path = require('path');
var fs = require("fs");
const PropertiesReader = require('properties-reader');
const instanceFile = "instance.properties"
const execCmd = require('../lib/execCmd');
const sshExec = require('../lib/ssh');
const scpExec = require('../lib/scp');
const M1Helper = require('../lib/m1Helper');
const WinHelper = require('../lib/winHelper');
const pathUtil = require("path");
const YamlParser = require('../lib/yamlParser');
const { config } = require('dotenv');
var sshConfig = null;
exports.command = 'deploy instance <job_name> <build_file>';
exports.desc = 'Create/Destroy production environment';
exports.builder = yargs => {
    yargs.options({
    });
};

let oneTimeSetup = true;

exports.handler = async argv => {
    const { processor, job_name, build_file} = argv;

    console.log(chalk.green("Deploying in production environment..."));

    let properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });
    sshConfig = {
      host: properties.get("IP"),
      port: 22,
      user: 'root',
      identifyFile: process.env.PVT_KEY_PATH
    }

    let jobName = pathUtil.basename( job_name );
    let buildFile = pathUtil.basename( build_file );

    let data = YamlParser.parse('./' + buildFile);

    if (processor == 'Arm64') {
        helper = new M1Helper();
    } else {
        helper = new WinHelper();
    }
    logPrefix = helper.getLogPrefix();  
    await helper.updateSSHConfig();

    prodSetupCompleted = false;
    await execCmd(`mkdir logs`);
    await execCmd(`mkdir ` + logPrefix);

    await sshExec("touch .status", sshConfig, false);
    await sshExec("cat .status > .status", sshConfig, false);

    fs.readFile('./.status', 'utf8' , (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      if(data.includes('setupCompleted=True')) {
        setupAlreadyDone = true;
      }
      if(data.includes('prodSetupCompleted=True')) {
        prodSetupAlreadyDone = true;
      }
      console.log(data);
    })

  

     
    await runSetup(data);

    for (const job of data.jobs) {
      if (job.name === jobName) {
        await runJob(job);
      }
    }


};

async function createSetup(data) {
  
  await execCmd(`echo '#!/bin/bash' > setup.sh`);
  await execCmd(`echo 'set -e' >> setup.sh`);
  await execCmd(`echo 'set -x' >> setup.sh`);

  let setupCmd;
  let runCmd;
  let isAptUpdate = false;
  const aptInstallCmd = 'sudo apt-get install -y ';
  const aptUpdateCmd = 'sudo apt-get update';
  
  for (const task of data.setup) {
      setupCmd = '';
      if(oneTimeSetup ) {
        if(task.hasOwnProperty("package")){
          setupCmd = aptInstallCmd + task.package;
        } else{
          setupCmd = task;
        }
    }
      await execCmd('echo "' + setupCmd + '" >> setup.sh');
  }
}

async function runSetup(data) {
  await helper.moveToDeployEnv();
  await createSetup(data);
  await scpExec("setup.sh", "~", sshConfig);
  await sshExec("bash setup.sh", sshConfig).then(function () {
     console.log("Setup Completed!")
     sshExec("'echo setupCompleted=True >> .status'", sshConfig);
  });;
}

async function runJob(job) {
  runCmd = '';
  console.log(chalk.green("Executing build job : "+ job.name));
  let config;
  if (job.steps) {
    for (const step of job.steps) {
        let x = step.run.substring(0, 4);
        config = helper.sshConfig;
        if (x === 'scp ') {
            step.run = x + '-i ssh/id_rsa -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r ~/iTrust2-v10/iTrust2/target/iTrust2-10.jar root@' + sshConfig.host + ':~';
          }
        if (x === 'java') {
          config = sshConfig;
      }
        runCmd = '"'+step.run+'"';
        await sshExec(runCmd, config);
    }
  }
}
