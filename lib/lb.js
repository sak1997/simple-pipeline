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
        this.GREEN = "http://" + this.properties.get("GREEN_IP") + ":8080";
        this.BLUE = "http://" + this.properties.get("BLUE_IP") + ":8080";
        this.TARGET = this.GREEN;
        console.log(this.TARGET);
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
            console.log(self.TARGET);
            // callback for redirecting requests.W
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
        this.properties = PropertiesReader(instanceFile, { writer: { saveSections: true } });
        this.GREEN = "http://" +  this.properties.get("GREEN_IP") + ":8080";
        this.BLUE = "http://" + this.properties.get("BLUE_IP") + ":8080";
        this.TARGET = this.GREEN;
        console.log("set to green -> " + this.GREEN);
   }

}

async function run() {

    console.log(chalk.keyword('pink')('Starting proxy on localhost:3090'));

    let prod = new Production();
    prod.proxy();

}

run();
