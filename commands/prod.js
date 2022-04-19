const chalk = require('chalk');
const path = require('path');


exports.command = 'prod up';
exports.desc = 'Create/Destroy production environment';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {
    const { processor } = argv;

    console.log(chalk.green("Creating production environment..."));
    let dropletId = createDroplet();
};

function createDroplet() {
  console.log("TODO");
  return 1;
}
