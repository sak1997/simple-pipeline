const chalk = require('chalk');
const path = require('path');
const M1Helper = require('../lib/m1Helper');

exports.command = 'init';
exports.desc = 'Prepare tool';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {
    const { processor } = argv;

    console.log(chalk.green("Preparing computing environment..."));
    if (processor == 'Arm64') {
      helper = new M1Helper();
    }

    await helper.init()
};
