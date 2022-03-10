const yaml = require('js-yaml')
const YAML = require('yaml')
const fs = require('fs')

class YamlParser {

     static parse(path){
    
        let fileContents = fs.readFileSync(path, 'utf8');
        //let data = yaml.load(fileContents);
        let data = YAML.parse(fileContents);

        //console.log(data);
        return data;
    }
}

module.exports =  YamlParser;

