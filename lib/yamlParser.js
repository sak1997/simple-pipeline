const yaml = require('js-yaml')
const YAML = require('yaml')
const fs = require('fs')

class YamlParser {

     static parse(){
    
        let fileContents = fs.readFileSync('./build.yml', 'utf8');
        //let data = yaml.load(fileContents);
        let data = YAML.parse(fileContents);

        console.log(data);

        data.setup.forEach(function(task){
            if(task.hasOwnProperty("package")){
                console.log(task)
            }
        });
  
        data.jobs.forEach(function(job) {
             console.log("run commands:-")
            // console.log(job);
            job.steps.forEach(function(step){
                console.log(step.run);
            })
            // console.log("---");
          });
        return data;
    }
}

module.exports =  YamlParser;

