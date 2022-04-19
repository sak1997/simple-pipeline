const path = require('path');
const os   = require('os');
const chalk = require("chalk");
const exec = require('child_process').exec;

module.exports = async function(src, dest, config, strict=true) {

    let scpExe = `scp -i "${config.identifyFile}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r ${src} ${config.user}@${config.host}:${dest}`;

    return new Promise(function (resolve, reject) {
        console.log( chalk.yellow(`${scpExe}`) );
        exec(`${scpExe}`, (error, stdout, stderr) => {
          console.error(error || stderr);
          console.log(stdout);

          if (error) {
            if (strict) {
              process.exit()
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
