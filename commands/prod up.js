const chalk = require('chalk');
const path = require('path');
var fs = require("fs");
const axios = require("axios");
const os = require('os');
var shell = require('shelljs');
const execCmd = require('../lib/execCmd');
const DOHelper = require('../lib/digitalOceanHelper')
const PropertiesReader = require('properties-reader');
const instanceFile = "instance.properties"

exports.command = 'prod up';
exports.desc = 'Create/Destroy production environment';
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

    console.log(chalk.green("Creating production environment..."));

    var fd = fs.openSync(instanceFile, 'a');
    const properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });

    await helper.deleteDroplet(properties.get("BLUE_ID"));
    let blueDropletId = await helper.createDroplet(process.env.DIGITAL_OCEAN_TOKEN, process.env.PUB_KEY_PATH);
    let blueDropletIp = await helper.getDropletIp(blueDropletId);
    properties.set("BLUE_ID", blueDropletId);
    properties.set("BLUE_IP", blueDropletIp);

    await helper.deleteDroplet(properties.get("GREEN_ID"));
    let greenDropletId = await helper.createDroplet(process.env.DIGITAL_OCEAN_TOKEN, process.env.PUB_KEY_PATH);
    let greenDropletIp = await helper.getDropletIp(greenDropletId);
    properties.set("GREEN_ID", greenDropletId);
    properties.set("GREEN_IP", greenDropletIp);

    await properties.save(instanceFile);

    await execCmd("forever stopall & forever start lib/lb.js");
};
