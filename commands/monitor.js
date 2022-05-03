const chalk = require('chalk');
const path = require('path');
var fs = require("fs");
const axios = require("axios");
const os = require('os');
var shell = require('shelljs');
const execCmd = require('../lib/execCmd');
const scpExec = require('../lib/scp');
const sshExec = require('../lib/ssh');
const DOHelper = require('../lib/digitalOceanHelper')
const PropertiesReader = require('properties-reader');
const instanceFile = "instance.properties"
const monitoringpath = "Monitoring"
exports.command = 'monitor';
exports.desc = 'Monitoring setup for blue-green';
exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { processor } = argv;

    let token = process.env.DIGITAL_OCEAN_TOKEN;
    // console.log("here " + process.env.DIGITAL_OCEAN_TOKEN);
    // console.log(process.env);
    helper = new DOHelper(token);

    console.log(chalk.green("Creating monitoring environment..."));

    var fd = fs.openSync(instanceFile, 'a');
    const properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });

    let blueIP = properties.get("BLUE_IP");
    let greenIP =  properties.get("GREEN_IP");

    let monitorID = await helper.createDroplet(process.env.DIGITAL_OCEAN_TOKEN, process.env.PUB_KEY_PATH);
    let monitorIP = await helper.getDropletIp(monitorID);
    properties.set("MONITOR_ID", monitorID);
    properties.set("MONITOR_IP", monitorIP);

    await properties.save(instanceFile);

    await new Promise(r => setTimeout(r, 120000));
    
    await execCmd("cp instance.properties monitoring/dashboard/instance.properties");
    await execCmd("cp instance.properties monitoring/agent/instance.properties");

    await doMonitoringSetup(monitorIP);

    await monitoringServiceSetup(blueIP, "blue");
    await monitoringServiceSetup(greenIP, "green");
};


async function doMonitoringSetup(IP) {

    var fd = fs.openSync(instanceFile, 'a');
    const properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });

    sshConfig = {
        host: IP,
        port: 22,
        user: 'root',
        identifyFile: process.env.PVT_KEY_PATH
      }

    // scp monitoring to the droplet
    await scpExec("Monitoring/dashboard", "~", null, sshConfig);

    await scpExec("monitorServerSetup.sh", "~", null, sshConfig);

    await sshExec("bash monitorServerSetup.sh > mserver.log", sshConfig);

    await execCmd("echo Monitoring Publisher Setup Completed!");

}

async function monitoringServiceSetup(IP, name) {

    var fd = fs.openSync(instanceFile, 'a');
    const properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });

    let monitorIP =  properties.get("MONITOR_IP");

    sshConfig = {
        host: IP,
        port: 22,
        user: 'root',
        identifyFile: process.env.PVT_KEY_PATH
      }

    // await scpExec(monitoringpath, "~", null, sshConfig);
    // await sshExec("apt-get install npm -y", sshConfig);
    // await sshExec("npm install forever -g", sshConfig);
    // await sshExec("cd monitoring/agent && forever start index.js " + name, sshConfig);

    // scp monitoring to the droplet
    await scpExec("Monitoring/agent", "~", null, sshConfig);

    await scpExec("monitorSubSetup.sh", "~", null, sshConfig);

    await sshExec("bash monitorSubSetup.sh " + name + " > mserversub.log", sshConfig);

    // await sshExec("'cd ~/agent && forever start index.js " + name +"'", sshConfig);

    await execCmd("echo Monitoring Subscriber Setup Completed!");

}
