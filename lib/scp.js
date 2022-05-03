const path = require('path');
const os   = require('os');
const chalk = require("chalk");
const exec = require('child_process').exec;

module.exports = async function(src, dest, srcConfig, destConfig, strict=true) {

    let scpExe = ``;
    if ((srcConfig !== null) && (destConfig !== null)) {
      await new Promise(r => setTimeout(r, 10000));
      scpExe = `scp -3 -i "${srcConfig.identifyFile}" -i "${destConfig.identifyFile}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r ${srcConfig.user}@${srcConfig.host}:${src} ${destConfig.user}@${destConfig.host}:${dest}`;
    } else if (destConfig !== null) {
      scpExe = `scp -i "${destConfig.identifyFile}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r ${src} ${destConfig.user}@${destConfig.host}:${dest}`;
    } else if (srcConfig !== null) {
      scpExe = `scp -i "${srcConfig.identifyFile}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r ${srcConfig.user}@${srcConfig.host}:${src} ${dest}`;
    }

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
