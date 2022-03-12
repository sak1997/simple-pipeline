const chalk = require('chalk');
const YamlParser = require('../lib/yamlParser');
const execCmd = require('../lib/execCmd');
const sshExec = require('../lib/ssh');
const M1Helper = require('../lib/m1Helper');
const WinHelper = require('../lib/winHelper');
const fs = require('fs');
const { help } = require('yargs');

exports.command = 'build';
exports.desc = 'Trigger a specified Build job';

exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { processor } = argv;

    if (processor == 'Arm64') {
      helper = new M1Helper();
    } else {
      helper = new WinHelper();
    }

    await helper.updateSSHConfig();

    let jobName = "build";

    console.log(chalk.green("started running build job"));

    let setupAlreadyDone = false;
    await sshExec("cat status.txt | grep setupCompleted=True > status.txt", helper.sshConfig);

    // await sshExec("cat status.txt", helper.sshConfig).then(function(op) {
    //   if(op === "setupCompleted=True") {
    //     console.log("here");
    //     setupAlreadyDone = true;
    //   }
    // }); 


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

    // await execCmd(`rm -r status.txt`);


    let sshCmd = 'ssh -i "/Users/smayanapidugu/Library/Application Support/basicvm/key" -p 22 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=900 ubuntu@192.168.64.74';
    const aptInstallCmd = 'sudo apt-get install -y ';
    const aptUpdateCmd = 'sudo apt-get update';
    let data = YamlParser.parse('./build.yml');

    let setupCmd;
    let runCmd;
    let isAptUpdate = false;
    // let a = '"'+'mvn -f /home/ubuntu/iTrust2-v10/iTrust2 clean test > /home/ubuntu/mvnOutput.txt'+'"';
    // await execCmd(`${sshCmd} ${a}`);
    //setup commands

    // await sshExec("touch setup.sh", helper.sshConfig);
    await execCmd(`echo > setup.sh`);

    if(setupAlreadyDone == false) {
      for (const task of data.setup) {
          setupCmd = '';
          if(task.hasOwnProperty("package")){
              if(!isAptUpdate){
                  // console.log(sshCmd+" "+aptUpdateCmd);
                  // await sshExec("'echo " + aptUpdateCmd + " >> setup.sh'", helper.sshConfig);
                  await execCmd('echo "' + aptUpdateCmd + '" >> setup.sh');
                  //await execCmd(`${sshCmd} ${aptUpdateCmd}`);
                  isAptUpdate = true;
              }
            setupCmd = aptInstallCmd + task.package;
          } else{
            setupCmd = task;
          }
          // console.log(sshCmd +" "+setupCmd);
          // await sshExec("'echo " + setupCmd + " >> setup.sh'", helper.sshConfig);
          await execCmd('echo "' + setupCmd + '" >> setup.sh');
        //await execCmd(`${sshCmd} ${setupCmd}`);
      }

      await helper.moveToBuildEnv();

      // await execCmd("sed -i 's/\"//g' setup.sh");
      // await sshExec("cp /bakerx/setup.sh ~/setup.sh", helper.sshConfig);
      // await sshExec("./setup.sh", helper.sshConfig);

      console.log("=====================================================================")
      await sshExec("touch status.txt", helper.sshConfig);
      await sshExec("'echo setupCompleted=True | tee status.txt'", helper.sshConfig);
      await sshExec("echo setupCompleted=True", helper.sshConfig);
    }

    // job commands
    for (const job of data.jobs) {
        if(jobName == job.name){
            runCmd = '';
            console.log(chalk.green("Executing build job : "+ jobName));

            for (const step of job.steps) {
                let x = step.run.substring(0, 9);
                if (x === 'git clone') {
                  step.run = x + ' https://' + process.env.USER_NAME + ':' + process.env.TOKEN + step.run.substring(10);
                }
                runCmd = '"'+step.run+'"';
                // console.log(sshCmd+" "+runCmd);
                await sshExec(runCmd, helper.sshConfig);
                // await execCmd(`${sshCmd} ${runCmd}`);
            }
        }
    }
};
