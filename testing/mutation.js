
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
    console.log("\nIteration " + i + ":");
    let srcfile = "" + args[1]; // target file to be mutated - project dir
    let dstfile = "testing/mutations/mutation" + i +".js" // dst file set to mutations directory in the same folder as this file
    rewrite(srcfile,dstfile);
}

function rewrite( filepath, newPath ) {

    var buf = fs.readFileSync(filepath, "utf8");
    var ast = esprima.parse(buf, options);

    let randnum = Math.floor(Math.random() * 7);

    let op = operations[randnum];
    // op = operations[0];
    op(ast);

    let code = escodegen.generate(ast);
    fs.writeFileSync( newPath, code);
}

function NegateConditionals(ast) {

    console.log("Running NegateConditionals...")

    let candidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && (node.operator === ">" || node.operator === "<" || node.operator === "==" || node.operator === "!=")) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "BinaryExpression" && (node.operator === ">" || node.operator === "<" || node.operator === "==" || node.operator === "!=") ) {
            if( current === mutateTarget ) {
                if(node.operator == ">" ) {
                    node.operator = "<"
                    console.log( chalk.red(`Replacing > with < on line ${node.loc.start.line}` ));
                } else if(node.operator == "==") {
                    node.operator = "!="
                    console.log( chalk.red(`Replacing == with != on line ${node.loc.start.line}` ));
                } else if(node.operator == "<") {
                    node.operator = ">"
                    console.log( chalk.red(`Replacing < with > on line ${node.loc.start.line}` ));
                } else if (node.operator == "!=") {
                    node.operator = "=="
                    console.log( chalk.red(`Replacing != with == on line ${node.loc.start.line}` ));
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
        if( node.type === "UpdateExpression" && (node.operator === "++" || node.operator === '--') && node.parent.type !== 'MemberExpression') {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "UpdateExpression" && (node.operator === "++" || node.operator === '--') && node.parent.type !== 'MemberExpression') {
            if( current === mutateTarget ) {
                var choice = Math.random() < 0.5;
                choice = true;
                if (choice) {
                  node.prefix = !node.prefix;
                  if (node.prefix) {
                    var x = 'sufix';
                    var y = 'prefix';
                  }
                  else {
                    var y = 'sufix';
                    var x = 'prefix';
                  }
                  console.log( chalk.red(`Replacing ` + node.operator + ` from ` + x + ` to ` + y + ` on line ${node.loc.start.line}` ));
                }
                else {
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
    let parentCandidates = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "IfStatement" && node.parent.type !== "IfStatement" && node.alternate !== null && node.alternate.type == "IfStatement") {
            parentCandidates++;
        }
    })
    let mutateTargetParent = getRandomInt(parentCandidates);
    let currentParent = 0;
    traverseWithParents(ast, (node) => {
      if( node.type === "IfStatement" && node.parent.type !== "IfStatement" && node.alternate !== null && node.alternate.type == "IfStatement") {
            if (currentParent === mutateTargetParent) {
              let candidates = 0;
              let childNode = node;
              while (childNode !== null && childNode.type === "IfStatement") {
                if( childNode.type === "IfStatement" ) {
                  candidates++;
                }
                childNode = childNode.alternate;
              }
              let mutateTargetFrom = getRandomInt(candidates);
              let mutateTargetTo = getRandomInt(candidates);
              while (mutateTargetTo === mutateTargetFrom) {
                mutateTargetTo = getRandomInt(candidates);
              }

              let srcTest = null;
              let destTest = null;
              let srcConc = null;
              let destConc = null;

              let current = 0;
              childNode = node;
              while (childNode !== null && childNode.type === "IfStatement") {
                  if( childNode.type === "IfStatement" ) {
                      if (current == mutateTargetFrom) {
                        srcTest = childNode.test;
                        srcConc = childNode.consequent;
                      }
                      if (current == mutateTargetTo) {
                        destTest = childNode.test;
                        destConc = childNode.consequent;
                      }
                      current++;
                  }
                  childNode = childNode.alternate;
              }
              current = 0;
              childNode = node;
              while (childNode !== null && childNode.type === "IfStatement") {
                if( childNode.type === "IfStatement" ) {
                  if (current == mutateTargetFrom) {
                    childNode.test = destTest;
                    childNode.consequent = destConc;
                  }
                  if (current == mutateTargetTo) {
                    childNode.test = srcTest;
                    childNode.consequent = srcConc;
                  }
                  current++;
                }
                childNode = childNode.alternate;
              }
              console.log( chalk.red(`Swapped expressions in if-else block in line ${srcTest.loc.start.line} and line ${destTest.loc.start.line}` ));

            }
            currentParent++;
        }
    })
}

function CloneReturnMutations(ast) {

    console.log("Running CloneReturnMutations...")

    // Get total candidate functions
    let candidateFunctions = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "FunctionDeclaration" ) {
            let flag = false;
            node.body.body.forEach((item, i) => {
              if (item.type === "ReturnStatement" && item.argument.type === "Identifier") {
                flag = true;
              }
            });
            if (flag) {
              candidateFunctions++;
            }
        }
    })

    // Get total return statements in the function
    let mutateTargetFunction = getRandomInt(candidateFunctions);
    let currentFunction = 0;
    let candidateSrc = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "FunctionDeclaration" ) {
          let flag = false;
            node.body.body.forEach((item, i) => {
              if (item.type === "ReturnStatement" && item.argument.type === "Identifier") {
                flag = true;
              }
            });
            if (flag) {
              if (currentFunction === mutateTargetFunction) {
                node.body.body.forEach((item, i) => {
                  if (item.type === "ReturnStatement" && item.argument.type === "Identifier") {
                    candidateSrc++;
                  }
                });
              }
              currentFunction++;
            }
        }
    })

    // Get pos and var used in the return statement
    let mutateTargetSrc = getRandomInt(candidateSrc);
    currentFunction = 0;
    let currentSrc = 0;
    let srcPos = null;
    let usedVar = null;
    traverseWithParents(ast, (node) => {
        if( node.type === "FunctionDeclaration" ) {
            let flag = false;
            node.body.body.forEach((item, i) => {
              if (item.type === "ReturnStatement" && item.argument.type === "Identifier") {
                flag = true;
              }
            });
            if (flag) {
              if (currentFunction === mutateTargetFunction) {
                node.body.body.forEach((item, i) => {
                  if (item.type === "ReturnStatement" && item.argument.type === "Identifier") {
                    if (currentSrc === mutateTargetSrc) {
                      srcPos = i;
                      usedVar = item.argument.name;
                    }
                    currentSrc++;
                  }
                });
              }
              currentFunction++;
            }
        }
    })

    // Get the pos of var used in the return statement
    currentFunction = 0;
    varPos = null;
    traverseWithParents(ast, (node) => {
        if( node.type === "FunctionDeclaration" ) {
            let flag = false;
            node.body.body.forEach((item, i) => {
              if (item.type === "ReturnStatement" && item.argument.type === "Identifier") {
                flag = true;
              }
            });
            if (flag) {
              if (currentFunction === mutateTargetFunction) {
                node.body.body.forEach((item, i) => {
                  if (item.type === "ExpressionStatement" && item.expression.type === "AssignmentExpression" && item.expression.left.name === usedVar) {
                    varPos = i;
                  }
                });
              }
              currentFunction++;
            }
        }
    })

    // clone return statement inbetween var declaration and return statement
    currentFunction = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "FunctionDeclaration" ) {
            let flag = false;
            node.body.body.forEach((item, i) => {
              if (item.type === "ReturnStatement" && item.argument.type === "Identifier") {
                flag = true;
              }
            });
            if (flag) {
              if (currentFunction === mutateTargetFunction) {
                let min = varPos + 1;
                let max = srcPos - 1;
                let mutateTarget = Math.floor(Math.random() * (max - min)) + min;
                destLoc = node.body.body[mutateTarget].loc.start.line
                srcLoc = node.body.body[srcPos].loc.start.line
                node.body.body[mutateTarget] = node.body.body[srcPos];
                console.log("Return statement is cloned from " + srcLoc + " to " + destLoc);
              }
              currentFunction++;
            }
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
        if( node.type === "Literal" && !isNaN(node.raw) && node.value != 0) {
            candidates++;
        }
    })

    let mutateTarget = getRandomInt(candidates);
    let current = 0;
    traverseWithParents(ast, (node) => {
        if( node.type === "Literal"  && !isNaN(node.raw) && node.value != 0) {
            if( current === mutateTarget ) {
                let oldval = node.value;
                let randnum = 2 + Math.floor(Math.random() * oldval);
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
