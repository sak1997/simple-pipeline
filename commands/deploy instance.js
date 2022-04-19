const chalk = require('chalk');
const path = require('path');
var fs = require("fs");
const PropertiesReader = require('properties-reader');
const instanceFile = "instance.properties"
const execCmd = require('../lib/execCmd');
const sshExec = require('../lib/ssh');
const scpExec = require('../lib/scp');
const pathUtil = require("path");
const YamlParser = require('../lib/yamlParser');
var sshConfig = null;
exports.command = 'deploy instance <job_name> <build_file>';
exports.desc = 'Create/Destroy production environment';
exports.builder = yargs => {
    yargs.options({
    });
};


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
      if(task.hasOwnProperty("package")){
          if(!isAptUpdate){
              await execCmd('echo "' + aptUpdateCmd + '" >> setup.sh');
              isAptUpdate = true;
          }
        setupCmd = aptInstallCmd + task.package;
      } else{
        setupCmd = task;
      }
      await execCmd('echo "' + setupCmd + '" >> setup.sh');
  }
}

async function runSetup(data) {
  await createSetup(data);
  await scpExec("setup.sh", "~", sshConfig);
  await sshExec("bash setup.sh", sshConfig).then(function () {
    console.log("Setup Completed!")
    sshExec("'echo setupCompleted=True >> .status'", helper.sshConfig);
  });;
}

async function runJob(job) {
  runCmd = '';
  console.log(chalk.green("Executing build job : "+ job.name));

  if (job.steps) {
    for (const step of job.steps) {
        let x = step.run.substring(0, 9);
        if (x === 'git clone') {
          step.run = x + ' https://' + process.env.USER_NAME + ':' + process.env.TOKEN + '@' + step.run.substring(10);
        }
        runCmd = '"'+step.run+'"';
        await sshExec(runCmd, sshConfig);
    }
  }
}
