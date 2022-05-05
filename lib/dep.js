const hasbin = require("hasbin");
const child  = require("child_process");
const chalk  = require("chalk")
const path   = require("path");

const envPath = path.join( path.dirname(require.main.filename), '.env');

const mustBin = (bin, hint) => {
    hint = hint || '';
    if (!hasbin.sync(bin)) throw new Error(`You must have ${bin} installed to run a vm. ${hint}`);
}

const mustEnv = (env, hint) => {
    if( ! process.env.hasOwnProperty(env) ) {
        throw new Error(`You must have ${env} defined. ${hint}`);
    }
}


exports.check = async argv => {
    let cmd = argv._[0];

    let processor = "Intel/Amd64";

    try {
        let output = child.execSync("uname -a").toString();
        if( output.match(/Darwin.*arm64/) ) {
            console.log( chalk.yellow("Mac M1 detected") );
            processor = "Arm64";
            mustBin("vm");
        } else {
            mustBin('VBoxManage');
        }

        let results = require('dotenv').config({path:envPath});

        if( results.error ) {
            console.log( chalk.red( "You should have a .env containing project specific environment variables" ));
            process.exit(1)
        }
        // else {
        //     console.log( chalk.yellow(`Loaded env file:\n${JSON.stringify(results, null, 3)}`));
        // }
        // You can enforce environment variable definitions here:
        // mustEnv("SOME_TOKEN", "You can get token from ...")

        if(processor != "Arm64") {
            mustEnv("IP", "Please set IP in " + envPath);
        }
        mustEnv("VM_NAME", "Please set VM_NAME in " + envPath);
        mustEnv("USER_NAME", "Please set USER_NAME in " + envPath);
        mustEnv("TOKEN", "Please set TOKEN in " + envPath);
        mustEnv("DIGITAL_OCEAN_TOKEN", "Please set DIGITAL_OCEAN_TOKEN in " + envPath);
        mustEnv("PUB_KEY_PATH", "Please set PUB_KEY_PATH in " + envPath);
        mustEnv("PVT_KEY_PATH", "Please set PVT_KEY_PATH in " + envPath);

    } catch ( err ) {
        console.log( chalk.red( err.message ));
        process.exit(1);
    }

    return {processor};
}
