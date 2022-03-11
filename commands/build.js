const chalk = require('chalk');
const YamlParser = require('../lib/yamlParser');
const execCmd = require('../lib/execCmd');
const sshExec = require('../lib/ssh');
const M1Helper = require('../lib/m1Helper');
const WinHelper = require('../lib/winHelper');

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

    let jobName = "build";
    //let jobName = "maven"

    console.log(chalk.green("started running build job"));

    let sshCmd = 'ssh -i "/Users/smayanapidugu/Library/Application Support/basicvm/key" -p 22 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=900 ubuntu@192.168.64.74';
    const aptInstallCmd = 'sudo apt install -y ';
    const aptUpdateCmd = '"sudo apt update"';
    let data = YamlParser.parse('./build.yml');

    let setupCmd;
    let runCmd;
    let isAptUpdate = false;
    // let a = '"'+'mvn -f /home/ubuntu/iTrust2-v10/iTrust2 clean test > /home/ubuntu/mvnOutput.txt'+'"';
    // await execCmd(`${sshCmd} ${a}`);
    //setup commands
    for (const task of data.setup) {
        setupCmd = '';
        if(task.hasOwnProperty("package")){
            if(!isAptUpdate){
                console.log(sshCmd+" "+aptUpdateCmd);
                await sshExec(aptUpdateCmd, helper.sshConfig);
                //await execCmd(`${sshCmd} ${aptUpdateCmd}`);
                isAptUpdate = true;
            }
          setupCmd = aptInstallCmd + task.package;
        } else{
          setupCmd = '"'+task+'"';
        }
        console.log(sshCmd +" "+setupCmd);
        await sshExec(setupCmd, helper.sshConfig);
       //await execCmd(`${sshCmd} ${setupCmd}`);
    }

    // job commands
    for (const job of data.jobs) {
        if(jobName == job.name){
            runCmd = '';
            console.log(chalk.green("Executing build job : "+ jobName));

            for (const step of job.steps) {
                runCmd = '"'+step.run+'"';
                console.log(sshCmd+" "+runCmd);
                await sshExec(runCmd, helper.sshConfig);
                //await execCmd(`${sshCmd} ${runCmd}`);
            }
        }
    }
};
