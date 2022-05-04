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
      'count': {
        alias: 'c',
        describe: 'Number of times to run',
        type: 'number',
        default: 1
      },
      'ip': {
        describe: 'IP of the server to run chaos on',
        type: 'string',
        default: null
      },
      'type': {
        alias: 't',
        describe: 'Type of the chaos to execute (file name from chaos dir without .sh)',
        type: 'string',
        default: null
      },
      'server': {
        alias: 's',
        describe: 'Server pool to run chaos. GREEN or BLUE server',
        type: 'string',
        default: 'GREEN'
      }
    });
};


exports.handler = async argv => {
    const { processor, count, ip, type, server} = argv;

    for (let i = 0; i < count; i++) {
      let selected_chaos = null;

      if (type !== null) {
        selected_chaos = type + ".sh";
      } else {
        let files = fs.readdirSync(chaosDir);
        files = files.filter(file => !file.startsWith("_"));
        selected_chaos = files[Math.floor(Math.random() * files.length)];

        if (!selected_chaos) {
          console.log("No chaos file found to execute");
          process.exit(1);
        }
      }

      serverNo = selectServer(server);

      let properties = PropertiesReader(instanceFile);
      selectedIp = ip;
      if (selectedIp === null) {
        selectedIp = properties.get(server + "_IP_" + serverNo);
      }

      console.log("Executing Chaos: " + selected_chaos + " on " + server + serverNo);

      let sshConfig = {
        host: selectedIp,
        port: 22,
        user: 'root',
        identifyFile: process.env.PVT_KEY_PATH
      }

      await scpExec("chaos/" + selected_chaos, "~/", null, sshConfig);
      let cmd = "bash " + selected_chaos;
      let runCmd = `"sh -c 'nohup ` + cmd  + ` &'"`
      sshExec(runCmd, sshConfig, true);
    }

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
