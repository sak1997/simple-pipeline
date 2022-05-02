const chalk = require('chalk');
const path = require('path');
const os = require('os');

const got = require('got');
const http = require('http');
const httpProxy = require('http-proxy');

const PropertiesReader = require('properties-reader');
const { ThisExpression } = require('esprima');
const instanceFile = "instance.properties"

class Production
{
    constructor()
    {
        this.properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });
        setInterval( this.updateServers.bind(this), 5000 );
        this.lastGreen = 0;
        this.lastBlue = 0;
        this.poolSize = this.properties.get("POOL_SIZE");
        this.ACTIVE_GREEN = [];
        this.ACTIVE_BLUE = [];
    }

    proxy()
    {
      try {
        // followRedirect: true
        let options = {}
        let proxy = httpProxy.createProxyServer(options);
        let that = this;

        // Redirect requests to the active TARGET (BLUE or GREEN)
        let server  = http.createServer(function(req, res)
        {
            let curGreen = roundRobinSelect(that.ACTIVE_GREEN, that.lastGreen);
            let curBlue = roundRobinSelect(that.ACTIVE_BLUE, that.lastBlue);
            if (curGreen > -1) {
              console.log("GREEN SERVER " + curGreen);
              that.lastGreen = curGreen;
              that.TARGET = that.ACTIVE_GREEN[curGreen];
            } else if (curBlue > -1) {
              console.log("BLUE SERVER " + curBlue);
              that.lastBlue = curBlue;
              that.TARGET = that.ACTIVE_BLUE[curBlue];
            }
            console.log(that.TARGET);
            // callback for redirecting requests.
            if (that.TARGET) {
              proxy.web( req, res, {target: that.TARGET } );
            }
        });
        server.listen(3090);
      } catch (error) {
        console.log(error);
      }
   }

   failover()
   {
      // this.TARGET = this.ACTIVE_BLUE[0];
   }

   async updateServers()
   {
        this.properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });
        this.ACTIVE_GREEN = [];
        this.ACTIVE_BLUE = [];
        let that = this;
        for (let i=0; i<this.poolSize; i++) {
          let url = "http://" + this.properties.get("GREEN_IP_" + i) + ":8080";
          await isActive(url).then(function(op) {
            if (op) {
                that.ACTIVE_GREEN.push(url);
            }
          });
        }

        for (let i=0; i<this.poolSize; i++) {
          let url = "http://" + this.properties.get("BLUE_IP_" + i) + ":8080";
          await isActive(url).then(function(op) {
            if (op) {
                that.ACTIVE_BLUE.push(url);
            }
          });
        }
   }
}

function roundRobinSelect(list, last) {
  if (list.length != 0) {
    return (last + 1) % list.length;
  } else {
    return -1;
  }
}

async function isActive(url) {
      try
      {
         const response = await got(url, {throwHttpErrors: false});
         let status = response.statusCode == 200 || response.statusCode == 404 ? chalk.green(response.statusCode) : chalk.red(response.statusCode);
         // console.log( chalk`{grey Health check on ${url}}: ${status}`);
         if (response.statusCode == 200 || response.statusCode == 404) {
           return true;
         } else {
           return false;
         }
      }
      catch (error) {
         console.log(error);
         return false;
      }
}

async function run() {

    console.log(chalk.keyword('pink')('Starting proxy on localhost:3090'));

    let prod = new Production();
    prod.proxy();

}

run();
