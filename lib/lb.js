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
        this.GREEN = this.properties.get("GREEN_IP");
        this.BLUE = this.properties.get("BLUE_IP");
        this.TARGET = this.GREEN;
        setInterval( this.updateServers.bind(this), 5000 );
    }

    proxy()
    {
        // followRedirect: true
        let options = {}        
        let proxy = httpProxy.createProxyServer(options);
        let self = this;

        // Redirect requests to the active TARGET (BLUE or GREEN)
        let server  = http.createServer(function(req, res)
        {
            // callback for redirecting requests.
            proxy.web( req, res, {target: self.TARGET } );
        });
        server.listen(3090);
   }

   failover()
   {
      this.TARGET = this.BLUE;
   }

   async updateServers()
   {
        this.GREEN = this.properties.get("GREEN_IP");
        this.BLUE = this.properties.get("BLUE_IP");
        console.log("set to green -> " + this.GREEN);
   }
   
}

async function run() {

    console.log(chalk.keyword('pink')('Starting proxy on localhost:3090'));

    let prod = new Production();
    prod.proxy();

}

run();