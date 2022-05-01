
const path = require('path');
const os   = require('os');
const chalk = require("chalk");
const exec = require('child_process').exec;

module.exports = async function(cmd, config, nohup = false, strict=true) {
    let foreverFlag = "";
    if (nohup) {
      foreverFlag = "-f"
    }
    let sshExe = `ssh ${foreverFlag} -i "${config.identifyFile}" -p ${config.port} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR ${config.user}@${config.host}`;

    return new Promise(function (resolve, reject) {
        console.log( chalk.yellow(`${sshExe} ${cmd}`) );
        exec(`${sshExe} ${cmd}`, (error, stdout, stderr) => {
          console.error(error || stderr);
          console.log(stdout);

          if (error) {
            if (strict) {
              process.exit(1)
            } else {
              resolve(error || stderr)
            }
          }

          if (stdout) {
            resolve(stdout)
          }
          resolve()

        });
    });


}
