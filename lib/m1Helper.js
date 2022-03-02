const execCmd = require('./execCmd');

class M1Helper {

  async init() {
    let name = process.env.VM_NAME;
    console.log('Running init...........')
    // TODO: check if image exists
    await execCmd(`vm pull ubuntu:focal`)
    await execCmd(`vm start ${name} ubuntu:focal`)
  }
}

module.exports = M1Helper;
