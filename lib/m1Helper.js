const execCmd = require('./execCmd');

const IMAGE = 'ubuntu:focal';
const LOGFILE = 'init.log';

class M1Helper {

  constructor() {
    this.sshConfig = {
        host: null,
        port: 22,
        user: 'ubuntu',
        identifyFile: process.env.KEY_LOC
    };
  }

  async init() {
    let name = process.env.VM_NAME;
    let pullImage = false;
    console.log('Running init...........');
    await execCmd(`vm images | grep ${IMAGE}`).then(function (op) {
      if (!op) {
        pullImage = true;
      }
    });
    if (pullImage) {
      await execCmd(`vm pull ${IMAGE} | tee ${LOGFILE}`);
    }

    await execCmd(`vm start ${name} ${IMAGE} | tee ${LOGFILE}`);

    let IP = null;
    await execCmd(`vm list | grep ${name} | awk '{print $6}'`).then(function (ip) {
        IP = ip.replace(/\n/g, '');
    });

    await execCmd(`touch vminfo.txt`);
    await execCmd(`echo > vminfo.txt`);
    await execCmd(`echo ip=${IP} >> vminfo.txt`);
  }

  async updateSSHConfig() {
    let host = null;
    await execCmd(`cat vminfo.txt | grep ip`).then(function (op) {
      host = op.substring(3).replace(/\n/g, '');
    });
    this.sshConfig.host = host;
  }

  async moveToBuildEnv() {
    await execCmd("sed -i 's/\"//g' setup.sh");
    await sshExec("cp ~/shared/cwd/setup.sh ~/setup.sh", helper.sshConfig);
    await sshExec("./setup.sh", helper.sshConfig);
  }
}

module.exports = M1Helper;
