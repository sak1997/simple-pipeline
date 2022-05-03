const chalk = require('chalk');
const path = require('path');
const M1Helper = require('../lib/m1Helper');
const WinHelper = require('../lib/winHelper');

exports.command = 'init';
exports.desc = 'Prepare ';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {
    const { processor } = argv;

    console.log(chalk.green("Preparing computing environment..."));
    if (processor == 'Arm64') {
      helper = new M1Helper();
    } else {
      helper = new WinHelper();
    }

    await helper.init()
    // shared dir in vm is not accessable if we dont wait (basicvm issue)
    await new Promise(r => setTimeout(r, 10000));

};
