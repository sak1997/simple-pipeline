const execCmd = require('./execCmd');

class M1Helper {

  async init() {
    let name = process.env.VM_NAME;
    let pullImage = false;
    console.log('Running init...........');
    await execCmd(`vm images | grep ubuntu:focal`).then(function (op) {
      if (!op) {
        pullImage = true;
      }
    });
    if (pullImage) {
      await execCmd(`vm pull ubuntu:focal`);
    }

    await execCmd(`vm start ${name} ubuntu:focal`);
  }
}

module.exports = M1Helper;
