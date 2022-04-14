const execCmd = require('./execCmd');
const sshExec = require('./ssh');

const IMAGE = 'ubuntu:focal';
const LOGFILE = 'init.log';

class M1Helper {

  constructor() {
    this.sshConfig = {
        host: null,
        port: 22,
        user: 'ubuntu',
        identifyFile: "/Users/ashok/Library/Application Support/basicvm/key"
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
    await sshExec("cp /home/ubuntu/shared/cwd/setup.sh /home/ubuntu/setup.sh", helper.sshConfig);
  }

  async moveTestingFilesToVM() {
    await sshExec("rm -rf /home/ubuntu/testing", this.sshConfig);
    await sshExec("'cp -r /home/ubuntu/shared/cwd/testing /home/ubuntu/'", this.sshConfig);
  }

  async getLogPrefix() {
    return "logs/" + Date.now() + "/";
  }
}

module.exports = M1Helper;
