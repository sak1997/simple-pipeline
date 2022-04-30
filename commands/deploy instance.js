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
const DOHelper = require('../lib/digitalOceanHelper')
const outputDirPath = "~/output"
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
    doHelper = new DOHelper(process.env.DIGITAL_OCEAN_TOKEN);

    // Delete Blue server
    await doHelper.deleteDroplet(properties.get("BLUE_ID"));

    // Change Green Server to Blue
    properties.set("BLUE_ID", properties.get("GREEN_ID"));
    properties.set("BLUE_IP", properties.get("GREEN_ID"));

    // Create new Green server
    let greenDropletId = await doHelper.createDroplet(process.env.DIGITAL_OCEAN_TOKEN, process.env.PUB_KEY_PATH);
    let greenDropletIp = await doHelper.getDropletIp(greenDropletId);
    properties.set("GREEN_ID", greenDropletId);
    properties.set("GREEN_IP", greenDropletIp);

    // Save instance info
    properties.save(instanceFile);

    await new Promise(r => setTimeout(r, 120000));

    sshConfig = {
      host: properties.get("GREEN_IP"),
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
    await helper.updateSSHConfig();

    // logPrefix = helper.getLogPrefix();

    // await execCmd(`mkdir logs`);
    // await execCmd(`mkdir ` + logPrefix);

    await scpExec(outputDirPath, "~", helper.sshConfig, sshConfig);

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
  await createSetup(data);
  await scpExec("setup.sh", "~", null, sshConfig);
  await sshExec("bash setup.sh", sshConfig).then(function () {
     console.log("Setup Completed!");
  });;
}

async function runJob(job) {
  runCmd = '';
  console.log(chalk.green("Executing build job : "+ job.name));
  if (job.steps) {
    for (const step of job.steps) {
      if (step.run){
        let x = step.run.substring(0, 9);
        if (x === 'git clone') {
          step.run = 'git -C "'+ step.run.substring(step.run.lastIndexOf('/')+1, step.run.lastIndexOf('.')) + '" pull || ' + x + ' https://' + process.env.USER_NAME + ':' + process.env.TOKEN + '@' + step.run.substring(10);
        }
        runCmd = '"'+step.run+'"';
        await sshExec(runCmd, sshConfig);
      }
    }
  }
}
