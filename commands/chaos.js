const chalk = require('chalk');
const path = require('path');
const sshExec = require('../lib/ssh');
const scpExec = require('../lib/scp');
const fs = require('fs');
const PropertiesReader = require('properties-reader');
const instanceFile = "instance.properties"
const chaosDir = "chaos";

exports.command = 'chaos';
exports.desc = 'Simulate chaos in random servers';
exports.builder = yargs => {
    yargs.options({
    });
};


exports.handler = async argv => {
    const { processor } = argv;

    let selected_chaos = null;
    let files = fs.readdirSync(chaosDir);
    files = files.filter(file => !file.startsWith("_"));
    selected_chaos = files[Math.floor(Math.random() * files.length)];

    if (!selected_chaos) {
      console.log("No chaos file found to execute");
      process.exit(1);
    }

    serverNo = selectServer("GREEN");
    // ip = "159.203.84.171";

    let properties = PropertiesReader(instanceFile);
    ip = properties.get("GREEN" + "_IP_" + serverNo);

    console.log("Executing Chaos: " + selected_chaos + " on " + "GREEN" + serverNo);

    let sshConfig = {
      host: ip,
      port: 22,
      user: 'root',
      identifyFile: process.env.PVT_KEY_PATH
    }

    await scpExec("chaos/" + selected_chaos, "~/", null, sshConfig);
    let cmd = "bash " + selected_chaos;
    let runCmd = `"sh -c 'nohup ` + cmd  + ` &'"`;
    sshExec(runCmd, sshConfig, true);

    process.exit(0);
};

// option = GREEN/BLUE
function selectServer(option) {
  let poolSize = process.env.POOL_SIZE;

  if (option !== "GREEN" && option !== "BLUE") {
    return null;
  }

  return Math.floor(Math.random() * poolSize);

}
