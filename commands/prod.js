const chalk = require('chalk');
const path = require('path');
var fs = require("fs");
const axios = require("axios");
const os = require('os');
var shell = require('shelljs');
const PropertiesReader = require('properties-reader');
const instanceFile = "instance.properties"

exports.command = 'prod up';
exports.desc = 'Create/Destroy production environment';
exports.builder = yargs => {
    yargs.options({
    });
};

var headers = null;

exports.handler = async argv => {
    const { processor } = argv;

    let token = process.env.DIGITAL_OCEAN_TOKEN;
    // console.log("here " + process.env.DIGITAL_OCEAN_TOKEN);
  // console.log(process.env);

  headers =
  {
    'Content-Type':'application/json',
    Authorization: 'Bearer ' + token
  };

    console.log(chalk.green("Creating production environment..."));

    var fd = fs.openSync(instanceFile, 'a');
    const properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });

    deleteDroplet(properties.get("ID"));
    let dropletId = await createDroplet(process.env.DIGITAL_OCEAN_TOKEN, process.env.PUB_KEY_PATH);
    let dropletIp = await getDropletIp(dropletId);

    properties.set("ID", dropletId);
    properties.set("IP", dropletIp);
    properties.save(instanceFile);

};

async function createDroplet(token, sshKey) {
    var cmd = " ssh-keygen -l -E md5 -f " + sshKey + " | awk '{print $2}'";
    // console.log(cmd);
    var output = shell.exec(cmd).toString();
    output = output.substring(4, output.length - 1);
    // console.log(output);

    var dropletName = os.hostname();
    var region = "nyc3"; // Fill one in from #1
    var imageName = "ubuntu-21-10-x64"; // Fill one in from #2

    var data =
    {
      "name": dropletName,
      "region":region,
      "size":"s-1vcpu-1gb",
      "image":imageName,
      "ssh_keys":[output],
      "backups":false,
      "ipv6":false,
      "user_data":null,
      "private_networking":null
    };

    console.log("Attempting to create: "+ JSON.stringify(data) );

    let response = await axios.post("https://api.digitalocean.com/v2/droplets",
    data,
    {
      headers:headers,
    }).catch( err =>
      console.error(chalk.red(`createDroplet: ${err}`))
    );
    // console.log("response = " + response);
    if( !response ) return;

    // console.log(response.status);
    // console.log(response.data);
    console.log("the droplet ID is " + response.data.droplet.id)

    if(response.status == 202)
    {
      console.log(chalk.green(`Created droplet id ${response.data.droplet.id}`));
    }

    return response.data.droplet.id;
}

async function getDropletIp(id) {
    if( typeof id != "number" )
    {
      console.log( chalk.red("You must provide an integer id for your droplet!") );
      return;
    }

    // Make REST request
    let response = await axios.get('https://api.digitalocean.com/v2/droplets/'+id, { headers: headers })
    .catch(err => console.error(`droplet info ${err}`));

    if( !response ) return;
    let dropletips = [];

    if( response.data.droplet )
    {
      let droplet = response.data.droplet;
      let i = 0;
      for(let v4net of droplet.networks.v4) {
        dropletips[i++] = v4net.ip_address;
      }
    }
    return dropletips[0];
}

async function deleteDroplet(id) {

  if( typeof id != "number" )
  {
    console.log( chalk.red("You must provide an integer id for your droplet!") );
    return;
  }

  // HINT, use the DELETE verb.
  let response = await axios.delete('https://api.digitalocean.com/v2/droplets/' + id, { headers: headers })
  .catch(err => console.error(`delete image ${err}`));

  if( !response ) return;

  // No response body will be sent back, but the response code will indicate success.
  // Specifically, the response code will be a 204, which means that the action was successful with no returned body data.
  if(response.status == 204)
  {
    console.log(`Deleted droplet ${id}`);
  } else {
    console.log('response code was NOT 204 but ' + response.status);
  }
}
