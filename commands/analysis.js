const esprima = require("esprima");
const options = {tokens:true, tolerant: true, loc: true, range: true };
const fs = require("fs");
const chalk = require('chalk');
const YamlParser = require('../lib/yamlParser');
const execCmd = require('../lib/execCmd');
const sshExec = require('../lib/ssh');
const pathUtil = require("path");
const M1Helper = require('../lib/m1Helper');
const WinHelper = require('../lib/winHelper');
const { help } = require('yargs');

exports.command = 'analyze <job_name> <build_file>';
exports.desc = 'static analysis of specified file';

exports.builder = yargs => {
    yargs.options({
    });
};

exports.handler = async argv => {
    const { processor, job_name, build_file} = argv;

    let jobName = pathUtil.basename( job_name );
    let buildFile = pathUtil.basename( build_file );
    if (processor == 'Arm64') {
      helper = new M1Helper();
	  suffix_path = "/home/ubuntu/shared/cwd/";
    } else {
      helper = new WinHelper();
	  suffix_path = "/bakerx/";
    }
    const logPrefix = helper.getLogPrefix();

    await helper.updateSSHConfig();
    let data = YamlParser.parse('./' + buildFile);

	for (const job of data.jobs) {
		if (job.name === jobName) {
			if (job.steps) {
				for (const step of job.steps) {
					sshExec('"'+"cp" + " "+ step.run+" "+ suffix_path+'"', helper.sshConfig);

					console.log( "Parsing ast and running static analysis of "+step.run.substring(step.run.lastIndexOf('/')+1));
					var builders = {};
					complexity(step.run.substring(step.run.lastIndexOf('/')+1), builders);
					//complexity("foo.js",builders);
					console.log( "Report");

					// Report
					for( var node in builders )
					{
						var builder = builders[node];
						builder.report();
					}
				}
		   }  
	    }
	}
};

function main()
{
	var args = process.argv.slice(2);

	if( args.length == 0 )
	{
		// default value is self if no other script is provided.
		args = ['analysis.js'];
	}
	var filePath = args[0];

	console.log( "Parsing ast and running static analysis...");
	var builders = {};
	complexity(filePath, builders);
	console.log( "Complete");


	// Report
	for( var node in builders )
	{
		var builder = builders[node];
		builder.report();
	}

}



function complexity(filePath, builders)
{
	var buf = fs.readFileSync(filePath, "utf8");
	var ast = esprima.parse(buf, options);

	var i = 0;

	// Initialize builder for file-level information
	var fileBuilder = new FileBuilder();
	fileBuilder.FileName = filePath;
	builders[filePath] = fileBuilder;

	// Traverse program with a function visitor.
	traverseWithParents(ast, function (node) 
	{
		// File level calculations
		// 1. Strings
		if( node.type == "Literal" && typeof node.value == "string" )
		{
			fileBuilder.Strings++;
		}

		// 2. Packages
		if( node.type == "ImportDeclaration" || (node.type == "CallExpression" && node.callee.type == "Identifier" && node.callee.name == "require"))
		{
			fileBuilder.ImportCount++;			
		}

		if (node.type === 'FunctionDeclaration' || node.type === "ArrowFunctionExpression") 
		{
			var builder = new FunctionBuilder();

			builder.FunctionName = functionName(node);
			builder.StartLine    = node.loc.start.line;
	
			// 3. Parameters
		
		    builder.ParameterCount = node.params.length;

			// 4. Method Length
			builder.Length = node.loc.end.line - builder.StartLine;

			// 5. CyclomaticComplexity
            traverseWithParents(node, function(child){
				 if(child.type === "IfStatement"){
					 builder.SimpleCyclomaticComplexity++;
				 }
			})
    

			// 6. Halstead
			identifiers=new Set();
			binaryExps=0;
			traverseWithParents(node, function (child_node){
				if(child_node.type=="Identifier"){
					identifiers.add(child_node.name)
				}
				else if(child_node.type=="BinaryExpression"){
					binaryExps++;
				}
			});
			builder.Halstead = identifiers.size+binaryExps;

			// 	depth =0 ;
			// 	maxdepth=0;
			// 	traverseWithParents(node, function (child_node){
			// 	if(childrenLength(node) == 0){
			// 		while(node.type != 'FunctionDeclaration' && node.type != "ArrowFunctionExpression"){
			//             pnode = node.parent;
			// 			if(isDecision(pnode)){
			//                 depth++;
			// 			}
			// 		}
			// 	}
			//     if(depth >= maxdepth){
			// 		maxdepth =depth;
			// 	}
			// });
			// builder.MaxNestingDepth = maxdepth;

		    builders[builder.FunctionName] = builder;
		}
	});
}

// Represent a reusable "class" following the Builder pattern.
class FunctionBuilder
{
	constructor() {
		this.StartLine = 0;
		this.FunctionName = "";
		// The number of parameters for functions
		this.ParameterCount  = 0;
		// The number of lines.
		this.Length = 0;
		// Number of if statements/loops + 1
		this.SimpleCyclomaticComplexity = 1;
		// Number of unique symbols + operators
		this.Halstead = 0;
		// The max depth of scopes (nested ifs, loops, etc)
		this.MaxNestingDepth    = 0;
		// The max number of conditions if one decision statement.
		this.MaxConditions      = 0;
	}

	threshold() {

        const thresholds = {
            SimpleCyclomaticComplexity: [{t: 10, color: 'red'}, {t: 4, color: 'yellow'}],
            Halstead: [{t: 10, color: 'red'}, {t: 3, color: 'yellow'}],
            ParameterCount: [{t: 10, color: 'red'}, {t: 3, color: 'yellow'}],
            Length: [{t: 100, color: 'red'}, {t: 10, color: 'yellow'} ]
        }

        const showScore = (id, value) => {
            let scores = thresholds[id];
            const lowestThreshold = {t: 0, color: 'green'};
            const score = scores.sort( (a,b) => {a.t - b.t}).find(score => score.t <= value) || lowestThreshold;
            return score.color;
        };

        this.Halstead = chalk`{${showScore('Halstead', this.Halstead)} ${this.Halstead}}`;
        this.Length = chalk`{${showScore('Length', this.Length)} ${this.Length}}`;
        this.ParameterCount = chalk`{${showScore('ParameterCount', this.ParameterCount)} ${this.ParameterCount}}`;
        this.SimpleCyclomaticComplexity = chalk`{${showScore('SimpleCyclomaticComplexity', this.SimpleCyclomaticComplexity)} ${this.SimpleCyclomaticComplexity}}`;

	}

	report()
	{
		this.threshold();

		console.log(
chalk`{blue.underline ${this.FunctionName}}(): at line #${this.StartLine}
Parameters: ${this.ParameterCount}\tLength: ${this.Length}
Cyclomatic: ${this.SimpleCyclomaticComplexity}\tHalstead: ${this.Halstead}\n`
);
	}
};

// A builder for storing file level information.
function FileBuilder()
{
	this.FileName = "";
	// Number of strings in a file.
	this.Strings = 0;
	// Number of imports in a file.
	this.ImportCount = 0;

	this.report = function()
	{
		console.log (
			chalk`{magenta.underline ${this.FileName}}
Packages: ${this.ImportCount}
Strings ${this.Strings}
`);

	}
}

// A function following the Visitor pattern.
// Annotates nodes with parent objects.
function traverseWithParents(object, visitor)
{
    var key, child;

    visitor.call(null, object);

    for (key in object) {
        if (object.hasOwnProperty(key)) {
            child = object[key];
            if (typeof child === 'object' && child !== null && key != 'parent') 
            {
            	child.parent = object;
					traverseWithParents(child, visitor);
            }
        }
    }
}

// Helper function for counting children of node.
function childrenLength(node)
{
	var key, child;
	var count = 0;
	for (key in node) 
	{
		if (node.hasOwnProperty(key)) 
		{
			child = node[key];
			if (typeof child === 'object' && child !== null && key != 'parent') 
			{
				count++;
			}
		}
	}	
	return count;
}


// Helper function for checking if a node is a "decision type node"
function isDecision(node)
{
	if( node.type == 'IfStatement' || node.type == 'ForStatement' || node.type == 'WhileStatement' ||
		 node.type == 'ForInStatement' || node.type == 'DoWhileStatement')
	{
		return true;
	}
	return false;
}

// Helper function for printing out function name.
function functionName( node )
{
	if( node.id )
	{
		return node.id.name;
	}
	return "anon function @" + node.loc.start.line;
}

