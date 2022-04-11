
const esprima = require("esprima");
const escodegen = require("escodegen");
const options = {tokens:true, tolerant: true, loc: true, range: true };
const fs = require("fs");
const chalk = require('chalk');
const [, , ...args] = process.argv;

let operations = [ NegateConditionals, ConditionalBoundaryMutations,  IncrementalMutations, ControlFlowMutations, CloneReturnMutations, NonEmptyStringMutationsFunction, ConstantReplacementMutations]

// Replace around line 24 the project dir location
// Requires a folder in the same directory called mutations
// How to run: node mutation.js 1000

// if unable to parse the number of iterations, it takes 10 by default
let no = Number(args[0]);
if (typeof no === 'undefined') {
    no = 10;
}
console.log("Running " + no + " iterations...");

// TO DO: File paths need to be changed
// REQUIRED: directory called mutations to store mutated files
for(let i = 1; i <= no; i++) {
    let srcfile = "checkbox.io-micro-preview/marqdown.js"; // target file to be mutated - project dir
    let dstfile = "testing/mutations/mutation" + i +".js" // dst file set to mutations directory in the same folder as this file
    rewrite(srcfile,dstfile);
}

function rewrite( filepath, newPath ) {

    var buf = fs.readFileSync(filepath, "utf8");
    var ast = esprima.parse(buf, options);

    let randnum = Math.floor(Math.random() * 7);

    let op = operations[randnum];

    op(ast);

    let code = escodegen.generate(ast);
    fs.writeFileSync( newPath, code);
}

function NegateConditionals(ast) {

    console.log("Running NegateConditionals...")

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && node.operator === ">" ) {
            candidates++;
        } else if ( node.type === "BinaryExpression" && node.operator === "==" ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && node.operator === ">" ) {
            if( current === mutateTarget ) {
                if(node.operator == ">" ) {
                    node.operator = "<"
                    console.log( chalk.red(`Replacing > with < on line ${node.loc.start.line}` ));
                } else if(node.operator == "==") {
                    node.operator = "!="
                    console.log( chalk.red(`Replacing == with != on line ${node.loc.start.line}` ));
                }
            }
            current++;
        }
    })

}

function ConditionalBoundaryMutations(ast) {

    console.log("Running ConditionalBoundaryMutations...")

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && node.operator === ">=" ) {
            candidates++;
        } else if ( node.type === "BinaryExpression" && node.operator === "<=" ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && (node.operator === ">=" || node.operator === '<=')) {
            if( current === mutateTarget ) {
                if(node.operator == ">=" ) {
                    node.operator = "<="
                    console.log( chalk.red(`Replacing >= with <= on line ${node.loc.start.line}` ));
                } else if(node.operator == "<=") {
                    node.operator = ">="
                    console.log( chalk.red(`Replacing <= with >= on line ${node.loc.start.line}` ));
                }
            }
            current++;
        }
    })

}

function IncrementalMutations(ast) {

    console.log("Running IncrementalMutations...")
    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "UpdateExpression" && (node.operator === "++" || node.operator === '--') ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "UpdateExpression" && (node.operator === "++" || node.operator === '--')) {
            if( current === mutateTarget ) {
                var choice = Math.random() < 0.5;
                if (choice) {
                  node.prefix = !node.prefix;
                  if (node.prefix) {
                    var x = 'sufix';
                    var y = 'prefix';
                  } else {
                    var y = 'sufix';
                    var x = 'prefix';
                  }
                  console.log( chalk.red(`Replacing ` + node.operator + ` from ` + x + ` to ` + y + ` on line ${node.loc.start.line}` ));
                } else {
                  if(node.operator == "++" ) {
                      node.operator = "--"
                      console.log( chalk.red(`Replacing ++ with -- on line ${node.loc.start.line}` ));
                  } else if(node.operator == "--") {
                      node.operator = "++"
                      console.log( chalk.red(`Replacing -- with ++ on line ${node.loc.start.line}` ));
                  }
                }
            }
            current++;
        }
    })
}

function ControlFlowMutations(ast) {

    console.log("Running ControlFlowMutations...")
    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "IfStatement" ) {
            candidates++;
        }
    })
    let mutateTargetFrom = getRandomInt(candidates);
    let mutateTargetTo = getRandomInt(candidates);
    while (mutateTargetTo === mutateTargetFrom) {
      mutateTargetTo = getRandomInt(candidates);
    }
    let src = null;
    let dest = null;
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "IfStatement" ) {
            if (current == mutateTargetFrom) {
              src = node.consequent;
            }
            if (current == mutateTargetTo) {
              dest = node.consequent;
            }
            current++;
        }
    })
    current = 0;
    traverseWithParents(ast, (node) => {
      if( node.type === "IfStatement" ) {
        if (current == mutateTargetFrom) {
          node.consequent = dest;
        }
        if (current == mutateTargetTo) {
          node.consequent = src;
        }
        current++;
      }
    })
    console.log( chalk.red(`Swapped expressions in if-else block in line ${src.loc.start.line} and line ${dest.loc.start.line}` ));

}

// TODO: CloneReturnMutations
function CloneReturnMutations(ast) {

    console.log("Running CloneReturnMutations...")

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "String" && node.value === "" ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "String" && node.value === "") {
            if( current === mutateTarget ) {
                if(node.value === "" ) {
                    node.value = "<div>Testing, one, two, three...</div>";
                    console.log( chalk.red(`Replacing "" with a <div> with content on line ${node.loc.start.line}` ));
                }
            }
            current++;
        }
    })
}

function NonEmptyStringMutationsFunction(ast) {

    console.log("Running NonEmptyStringMutations...")

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" && node.value === "" ) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" && node.value === "") {
            if( current === mutateTarget ) {
                if(node.value === "" ) {
                    node.value = "<div>Testing, one, two, three...</div>";
                    console.log( chalk.red(`Replacing "" with a <div> with content on line ${node.loc.start.line}` ));
                }
            }
            current++;
        }
    })

}


function ConstantReplacementMutations(ast) {

    console.log("Running ConstantReplacementMutations...")

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal" && !isNaN(node.raw)) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal"  && !isNaN(node.raw)) {
            if( current === mutateTarget ) {
                let oldval = node.value;
                let randnum = Math.floor(Math.random() * 1000);
                node.value = randnum;
                // console.log(node.value + " is node new value");
                console.log( chalk.red(`Replacing ${oldval} with a ${randnum} with content on line ${node.loc.start.line}` ));
            }
            current++;
        }
    })

}



function getRandomInt(max) {
    return Math.floor(Math.random() * max);
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
