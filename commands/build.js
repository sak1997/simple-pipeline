const chalk = require('chalk');
const YamlParser = require('../lib/yamlParser');
const execCmd = require('../lib/execCmd');
const sshExec = require('../lib/ssh');
const M1Helper = require('../lib/m1Helper');
const WinHelper = require('../lib/winHelper');
const fs = require('fs');
const { help } = require('yargs');
const pathUtil = require("path");
const oneTimeSetup = true;

exports.command = 'build <job_name> <build_file>';
exports.desc = 'Trigger a specified Build job';

exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { processor, job_name, build_file} = argv;

    let jobName = pathUtil.basename( job_name );
    let buildFile = pathUtil.basename( build_file );

    if (processor == 'Arm64') {
      helper = new M1Helper();
    } else {
      helper = new WinHelper();
    }
    const logPrefix = helper.getLogPrefix();

    await helper.updateSSHConfig();


    console.log(chalk.green("started running build job"));

    let setupAlreadyDone = false;
    let testingSetupCompleted = false;

    await execCmd(`mkdir logs`);
    await execCmd(`mkdir ` + logPrefix);

    await sshExec("touch .status", helper.sshConfig, false);
    await sshExec("cat .status > .status", helper.sshConfig, false);

    fs.readFile('./.status', 'utf8' , (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      if(data.includes('setupCompleted=True')) {
        setupAlreadyDone = true;
      }
      if(data.includes('testingSetupCompleted=True')) {
        testingSetupCompleted = true;
      }
      console.log(data);
    })

    const aptInstallCmd = 'sudo apt-get install -y ';
    const aptUpdateCmd = 'sudo apt-get update';
    let data = YamlParser.parse('./' + buildFile);

    let setupCmd;
    let runCmd;
    let isAptUpdate = false;

    // await execCmd(`rm setup.sh`);

    await execCmd(`echo '#!/bin/bash' > setup.sh`);
    await execCmd(`echo 'set -e' >> setup.sh`);
    await execCmd(`echo 'set -x' >> setup.sh`);

    // // Remove if pkg is fixed
    // const rmDamagedPkg1 = 'sudo apt remove flash-kernel -y';
    // // const rmDamagedPkg2 = 'sudo apt remove u-boot-rpi:arm64 -y'
    // await execCmd('echo "' + rmDamagedPkg1 + '" >> setup.sh');
    // // await execCmd('echo "' + rmDamagedPkg2 + '" >> setup.sh');

    // await execCmd('echo "' + aptInstallCmd + '" >> setup.sh');
    if(oneTimeSetup && (!setupAlreadyDone)) {
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
      // await new Promise(r => setTimeout(r, 10000));
      await helper.moveToBuildEnv();
      await sshExec("bash setup.sh | tee " + logPrefix + "setup.log", helper.sshConfig).then(function () {
        console.log("=====================================================================")
        sshExec("'echo setupCompleted=True >> .status'", helper.sshConfig);
      });

    }

    // job commands
    for (const job of data.jobs) {
        if(jobName == job.name){
            runCmd = '';
            console.log(chalk.green("Executing build job : "+ jobName));

            if (job.mutation) {
              await mutation(job.mutation, helper, testingSetupCompleted, logPrefix);
            }

            if (job.steps) {
              for (const step of job.steps) {
                  let x = step.run.substring(0, 9);
                  if (x === 'git clone') {
                    step.run = x + ' https://' + process.env.USER_NAME + ':' + process.env.TOKEN + '@' + step.run.substring(10);
                  }
                  runCmd = '"'+step.run+'"';
                  await sshExec(runCmd, helper.sshConfig);
              }
            }
        }
    }
};

async function mutation(info, helper, testingSetupCompleted, logPrefix) {
  console.log(info);

  await helper.moveTestingFilesToVM();

  urlContent = info.url.split("/");
  let mutateFile = info.mutationfile;
  let repoDir = urlContent[urlContent.length - 1];

  await sshExec('rm -rf ' + repoDir, helper.sshConfig);

  let secrets = process.env.USER_NAME + ':' + process.env.TOKEN;
  let cloneCmd = 'git clone https://' + secrets + '@' + info.url.substring(8);
  console.log(cloneCmd);
  await sshExec(cloneCmd, helper.sshConfig);

  if (oneTimeSetup && (!testingSetupCompleted)) {
    await sshExec('bash testing/testingSetup.sh | tee ' + logPrefix + 'testingSetup.log', helper.sshConfig).then(function () {
      sshExec("'echo testingSetupCompleted=True >> .status'", helper.sshConfig);
    });
  }

 await sshExec('bash testing/testingPrep.sh | tee ' + logPrefix + 'testingPrep.log', helper.sshConfig)
  await sshExec('npm install express --prefix ' + repoDir, helper.sshConfig);

  let iterations = Number(info.iterations);
  console.log(iterations + " " + typeof(iterations));

  // let mutatecommand = "node testing/mutation.js " + iterations;
  await sshExec('node testing/mutation.js ' + iterations + ' ' + repoDir + '/' + mutateFile + ' | tee ' + logPrefix + 'mutation.log', helper.sshConfig);


  for(let i = 0; i < info.snapshots.length; i++) {
    await sshExec("bash testing/prepareForSnapshot.sh " + repoDir + " " + info.snapshots[i] + " " + i, helper.sshConfig);
  }

  // for (let i = 0; i < info.snapshots.length; i++) {
  //   let snapshotCommand = "bash testing/takeSnapshot.sh " + iterations  + " " + info.snapshots[i] + " " + repoDir + " " + i + " >> snapshot.log";
  //   await sshExec("'" + snapshotCommand + "'", helper.sshConfig);
  // }

  for(let i = 1; i <= iterations; i++) {
    await sshExec("bash testing/startapp.sh " + i + " " + repoDir + " " + mutateFile, helper.sshConfig);
    for(let j = 0; j < info.snapshots.length; j++) {
      await sshExec("bash testing/takeMySnapshot.sh " + info.snapshots[j] + " " + j + " " + i, helper.sshConfig);
    }
    await sshExec("bash testing/stopapp.sh " + repoDir, helper.sshConfig);
  }

  await sshExec("cp marqdown.js " + repoDir + "/marqdown.js", helper.sshConfig);

  await sshExec("node testing/snapshotCompare.js " + info.iterations + " " + info.snapshots.length + " | tee " + logPrefix + "results.log", helper.sshConfig);

};
