const chalk = require('chalk');
const YamlParser = require('../lib/yamlParser');
const execCmd = require('../lib/execCmd');
const sshExec = require('../lib/ssh');
const M1Helper = require('../lib/m1Helper');
const WinHelper = require('../lib/winHelper');
const fs = require('fs');
const { help } = require('yargs');
const pathUtil = require("path");
const HtmlDiffer = require('html-differ').HtmlDiffer;
var logger = require('html-differ/lib/logger');

exports.command = 'build <job_name> <build_file>';
exports.desc = 'Trigger a specified Build job';

exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { processor, job_name, build_file} = argv;

    let jobName = "mutation-coverage";
    let buildFile = "./build.yml";


    // let jobName = pathUtil.basename( job_name );
    // let buildFile = pathUtil.basename( build_file );
    
    // if (processor == 'Arm64') {
    //   helper = new M1Helper();
    // } else {
    //   helper = new WinHelper();
    // }
    // await helper.updateSSHConfig();


    // console.log(chalk.green("started running build job"));

    // let setupAlreadyDone = false;
    // await sshExec("cat status.txt | grep setupCompleted=True > status.txt", helper.sshConfig);


    // fs.readFile('./status.txt', 'utf8' , (err, data) => {
    //   if (err) {
    //     console.error(err)
    //     return
    //   }
    //   if(data.includes('setupCompleted=True')) {
    //     setupAlreadyDone = true;
    //     console.log("here");
    //   }
    //   console.log(data);
    //   console.log("here!");
    // })

    // const aptInstallCmd = 'sudo apt-get install -y ';
    // const aptUpdateCmd = 'sudo apt-get update';
    let data = YamlParser.parse('./' + buildFile);

    // let setupCmd;
    // let runCmd;
    // let isAptUpdate = false;

    // await execCmd(`echo > setup.sh`);
    // await execCmd('echo "' + aptUpdateCmd + '" >> setup.sh');
    // if(setupAlreadyDone == false) {
    //   for (const task of data.setup) {
    //       setupCmd = '';
    //       if(task.hasOwnProperty("package")){
    //           if(!isAptUpdate){
    //               await execCmd('echo "' + aptUpdateCmd + '" >> setup.sh');
    //               isAptUpdate = true;
    //           }
    //         setupCmd = aptInstallCmd + task.package;
    //       } else{
    //         setupCmd = task;
    //       }
    //       await execCmd('echo "' + setupCmd + '" >> setup.sh');
    //   }

    //   await helper.moveToBuildEnv();

    //   console.log("=====================================================================")
    //   await sshExec("touch status.txt", helper.sshConfig);
    //   await sshExec("'echo setupCompleted=True > status.txt'", helper.sshConfig);
    // }

    // job commands
    for (const job of data.jobs) {
        if(jobName == job.name){
            runCmd = '';
            console.log(chalk.green("Executing build job : "+ jobName));

            if (job.mutation) {
              //await mutation(job.mutation, helper);
              await mutation(job.mutation);
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

async function mutation(info) {
  console.log(info);

  // helper.moveTestingFilesToVM();

  // let secrets = process.env.USER_NAME + ':' + process.env.TOKEN;
  // let cloneCmd = 'git clone https://' + secrets + '@' + info.url.substring(8);
  // console.log(cloneCmd);
  // await sshExec(cloneCmd, helper.sshConfig);

  // await sshExec('sudo apt install nodejs npm -y', helper.sshConfig);
  // await sshExec('npm init', helper.sshConfig);
  // await sshExec('npm install esprima', helper.sshConfig);
  // await sshExec('npm install escodegen', helper.sshConfig);
  // await sshExec('npm install chalk@4.1.0', helper.sshConfig);
  // await sshExec('npm install puppeteer', helper.sshConfig);
  // await sshExec('npm install', helper.sshConfig);
  // await sshExec('npm link');

  // await sshExec('bash testing/testingprep.sh', helper.sshConfig);

  // await sshExec('npm install express --prefix checkbox.io-micro-preview', helper.sshConfig);

  //await sshExec('mkdir testing/mutations', helper.sshConfig);

  let iterations = Number(info.iterations);
  let passedTests =0;
  let failedTests =0;
  console.log(iterations + " " + typeof(iterations));

  if (info.snapshots) {
    for (const snapshot of info.snapshots) {
    // fuzz and take screenshot 
    let name = snapshot.substring( snapshot.lastIndexOf("/") + 1, snapshot.indexOf(".")); 
    await execCmd('bash testing/takeSnapshot.sh '+ snapshot+ ' ' +name + ' ' + info.iterations);
    // compare snapshots
    for (let i = 1; i <= info.iterations; i++){
      const html1 = fs.readFileSync("html_snapshots/orig_"+name+".html", 'utf-8');
      const html2 = fs.readFileSync("html_snapshots/snap_"+name+i+".html", 'utf-8');
      if(compareScreenshots(html1,html2)){
        passedTests++;
      }else{
        failedTests++;
      }
    }
    }
  } 

  console.log("------------")
  console.log("RESULT");
  console.log(`passed: ${chalk.green(passedTests)}, exceptions: ${chalk.red(failedTests)}`);
  console.log();
  console.log("------------")


};

async function compareScreenshots(html1,html2){
  
  const options = {
    ignoreAttributes: [],
    compareAttributesAsJSON: [],
    ignoreWhitespaces: true,
    ignoreComments: true,
    ignoreEndTags: false
  };

  const htmlDiffer = new HtmlDiffer(options);
  const diff = await htmlDiffer.diffHtml(html2, html1);
  const isEqual = await htmlDiffer.isEqual(html1, html2);
  const res = logger.getDiffText(diff, { charsAroundDiff: 40 });

  //logger.logDiffText(diff, { charsAroundDiff: 40 });

  return isEqual;
}
