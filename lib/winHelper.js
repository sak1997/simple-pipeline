const execCmd = require('./execCmd');

class WinHelper {

  async init() {
    let name = process.env.VM_NAME;
    let ipaddr = process.env.IP;
    console.log('Running Win init...........')
    await execCmd(`bakerx pull focal cloud-images.ubuntu.com`)
    await execCmd(`bakerx run ${name} focal --ip ${ipaddr} --sync > vmcreate.txt`);

    await execCmd(`touch vminfo.txt`);
    await execCmd(`echo user=vagrant > vminfo.txt`);
    await execCmd(`echo ip=${ipaddr} >> vminfo.txt`);
    await execCmd(`echo "private_key is located at :" >> vminfo.txt`);
    await execCmd(`cat vmcreate.txt | grep "ssh -i" | awk '{print $3}' >> vminfo.txt`);
  }
}

module.exports = WinHelper;
