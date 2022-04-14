const execCmd = require('./execCmd');
const fs = require('fs')
const sshExec = require('./ssh');

class WinHelper {

  constructor() {
    // let keyloc = null;
    // await execCmd(`cat vmcreate.txt | grep "ssh -i" | awk '{print $3}'`).then(
    //   function(op) {
    //     console.log(op);
    //     keyloc = op.slice(1, -2);
    //   }
    // );

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

    console.log('WARNING: THIS WILL CLEAR ANY VM WITH THE VMNAME IN THE .env FILE')
    await execCmd(`bakerx delete vm ${name}`);

    await execCmd(`bakerx pull focal cloud-images.ubuntu.com`)
    await execCmd(`bakerx run ${name} focal --ip ${ipaddr} --sync --memory 3072 > vmcreate.txt`);

    await execCmd(`touch vminfo.txt`);
    await execCmd(`echo user=vagrant > vminfo.txt`);
    await execCmd(`echo ip=${ipaddr} >> vminfo.txt`);
    await execCmd(`echo private_key is located at : >> vminfo.txt`);
    await execCmd(`cat vmcreate.txt | grep "ssh -i" | awk '{print $3}' >> vminfo.txt`);

    // await execCmd(`cat vmcreate.txt | grep "ssh -i" | awk '{print $3}'`).then(
    //   function(op) {
    //     console.log(op);
    //     keyloc = op.slice(1, -2);
    //   }
    // );

    // this.sshConfig.identifyFile = keyloc;

    // this.sshConfig = {
    //   host: process.env.IP,
    //   port: 22,
    //   user: 'vagrant',
    //   identifyFile: keyloc
    // };

    // console.log(this.sshConfig);
    // await sshExec("touch thisfile.txt", this.sshConfig);

  }

  async updateSSHConfig() {
    let keyloc = null;
    await execCmd(`cat vmcreate.txt | grep "ssh -i" | awk '{print $3}'`).then(
      function(op) {
        console.log(op);
        keyloc = op.slice(1, -2);
      }
    );

    this.sshConfig.identifyFile = keyloc;
  }

  async moveToBuildEnv() {
    await execCmd("sed -i 's/\"//g' setup.sh");
    await sshExec("cp /bakerx/setup.sh ~/setup.sh", this.sshConfig);
    // await sshExec("./setup.sh", this.sshConfig);
  }

  async moveTestingFilesToVM() {
    await sshExec("rm -rf ~/testing", this.sshConfig);
    await sshExec("'cp -R /bakerx/testing ~/'", this.sshConfig);
  }

  getLogPrefix() {
    let logPrefix = "logs\\" + Date.now() + "\\";
    return logPrefix;
  }


}

module.exports = WinHelper;
