const chalk = require('chalk');
const YamlParser = require('../lib/yamlParser');
const execCmd = require('../lib/execCmd');
const sshExec = require('../lib/ssh');
const M1Helper = require('../lib/m1Helper');
const WinHelper = require('../lib/winHelper');
const fs = require('fs');
const { help } = require('yargs');
const pathUtil = require("path");

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

    await helper.updateSSHConfig();


    console.log(chalk.green("started running build job"));

    let setupAlreadyDone = false;
    await sshExec("cat status.txt | grep setupCompleted=True > status.txt", helper.sshConfig);


    fs.readFile('./status.txt', 'utf8' , (err, data) => {
      if (err) {
        console.error(err)
        return
      }
      if(data.includes('setupCompleted=True')) {
        setupAlreadyDone = true;
        console.log("here");
      }
      console.log(data);
      console.log("here!");
    })

    const aptInstallCmd = 'sudo apt-get install -y ';
    const aptUpdateCmd = 'sudo apt-get update --fix-missing';
    let data = YamlParser.parse('./' + buildFile);

    let setupCmd;
    let runCmd;
    let isAptUpdate = false;

    await execCmd(`rm setup.sh`);
    await execCmd(`touch setup.sh`);

    // // Remove if pkg is fixed
    // const rmDamagedPkg1 = 'sudo apt remove flash-kernel -y';
    // const rmDamagedPkg2 = 'sudo apt remove u-boot-rpi:arm64 -y'
    // await execCmd('echo "' + rmDamagedPkg1 + '" >> setup.sh');
    // await execCmd('echo "' + rmDamagedPkg2 + '" >> setup.sh');

    await execCmd('echo "' + aptUpdateCmd + '" >> setup.sh');
    if(setupAlreadyDone == false) {
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

      await helper.moveToBuildEnv();
      await sshExec("ls", helper.sshConfig);
      await sshExec("bash setup.sh", helper.sshConfig).then(function () {
        console.log("=====================================================================")
        sshExec("touch status.txt", helper.sshConfig);
        sshExec("'echo setupCompleted=True > status.txt'", helper.sshConfig);
      });

    }

    // job commands
    for (const job of data.jobs) {
        if(jobName == job.name){
            runCmd = '';
            console.log(chalk.green("Executing build job : "+ jobName));

            if (job.mutation) {
              await mutation(job.mutation, helper);
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

async function mutation(info, helper) {
  console.log(info);

  await helper.moveTestingFilesToVM();

  let secrets = process.env.USER_NAME + ':' + process.env.TOKEN;
  let cloneCmd = 'git clone https://' + secrets + '@' + info.url.substring(8);
  console.log(cloneCmd);
  await sshExec(cloneCmd, helper.sshConfig);

  await sshExec('bash testing/testingprep.sh', helper.sshConfig);

  await sshExec('npm install express --prefix checkbox.io-micro-preview', helper.sshConfig);

  let iterations = Number(info.iterations);
  console.log(iterations + " " + typeof(iterations));

  let mutatecommand = "node testing/mutation.js " + iterations;
  await sshExec("'" + mutatecommand + "'", helper.sshConfig);

  let snaphshotcommand = "bash testing/takeSnapshot.sh " + iterations + " > snapshotlog.log";
  await sshExec("'" + snaphshotcommand + "'", helper.sshConfig);

  console.log("here now!");


};
