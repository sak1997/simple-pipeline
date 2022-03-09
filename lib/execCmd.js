const chalk = require("chalk");
const exec = require('child_process').exec;

module.exports = async function(cmd) {
  return new Promise(function (resolve, reject) {
        console.log( chalk.yellow(`${cmd}`) );
        exec(`${cmd}`, (error, stdout, stderr) => {
            console.log(error || stderr);
            console.log(stdout);
            resolve(stdout)
        });
    });
}
