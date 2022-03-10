const execCmd = require('./execCmd');

const IMAGE = 'ubuntu:jammy';
const LOGFILE = 'init.log';

class M1Helper {

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
  }
}

module.exports = M1Helper;
