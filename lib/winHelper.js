const execCmd = require('./execCmd');
const fs = require('fs')
const sshExec = require('./ssh');

class WinHelper {

  constructor() {
    this.sshConfig = {
      host: process.env.IP,
      port: 22,
      user: 'vagrant',
      identifyFile: null //TODO: https://github.ncsu.edu/CSC-DevOps-S22/DEVOPS-20/issues/17
    };
  }

  async init() {
    let name = process.env.VM_NAME;
    let ipaddr = process.env.IP;
    let keyloc = "unavailable";
    console.log('Running Win init...........')
    await execCmd(`bakerx pull focal cloud-images.ubuntu.com`)
    await execCmd(`bakerx run ${name} focal --ip ${ipaddr} --sync --memory 3072 > vmcreate.txt`);

    await execCmd(`touch vminfo.txt`);
    await execCmd(`echo user=vagrant > vminfo.txt`);
    await execCmd(`echo ip=${ipaddr} >> vminfo.txt`);
    await execCmd(`echo private_key is located at : >> vminfo.txt`);
    await execCmd(`cat vmcreate.txt | grep "ssh -i" | awk '{print $3}' >> vminfo.txt`);

    await execCmd(`cat vmcreate.txt | grep "ssh -i" | awk '{print $3}'`).then(
      function(op) {
        console.log(op);
        keyloc = op.slice(1, -2);
      }
    );

    this.sshConfig = {
      host: process.env.IP,
      port: 22,
      user: 'vagrant',
      identifyFile: keyloc
    };

    // console.log(this.sshConfig);
    // await sshExec("touch thisfile.txt", this.sshConfig);

  }
}

module.exports = WinHelper;
