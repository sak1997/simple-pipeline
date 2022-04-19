const chalk = require('chalk');
const path = require('path');
var fs = require("fs");
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

    console.log(chalk.green("Creating production environment..."));

    var fd = fs.openSync(instanceFile, 'a');
    const properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });

    deleteDroplet(properties.get("ID"));
    let dropletId = createDroplet(process.env.DIGITAL_OCEAN_TOKEN, process.env.PUB_KEY_PATH);
    let dropletIp = getDropletIp(dropletId);

    properties.set("ID", dropletId);
    properties.set("IP", dropletIp);
    properties.save(instanceFile);
};

function createDroplet() {
  console.log("TODO: Create Droplet");
  return -1;
}

function getDropletIp(dropletId) {
  console.log("TODO: Get Droplet ID");
  return -1;
}

function deleteDroplet(dropletId) {
  if ( dropletId !== null ) {
    console.log("TODO: Delete Droplet");
  }
}
