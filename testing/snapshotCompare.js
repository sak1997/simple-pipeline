const { CONNREFUSED } = require('dns');
const fs = require('fs');
const htmlCompare = require('html-compare');
const chalk = require('chalk');

const [, , ...args] = process.argv;


let count = 0;
let totalIterationsWithoutError = args[0];
let total = args[0];
tempfun(args[0], args[1]);

console.log(("\n\nMutation coverage: "));
console.log(("Total: " + total ));
console.log(("Passed: " + count + "(" + count*100/total + "%)"));
console.log(("Failed: " + (totalIterationsWithoutError - count) + "(" + (totalIterationsWithoutError - count)*100/total + "%)"));
console.log(("Exceptions(killed mutant): " + (total - totalIterationsWithoutError) + "(" + (total - totalIterationsWithoutError)*100/total + "%)"));

function run(arg1, arg2) {

  const html1 = fs.readFileSync(arg1, 'utf-8');
  if(!fs.existsSync(arg2)) {
    console.log("file " + arg2 + " not found - runtime error! This case will NOT be considered in coverage");
    totalIterationsWithoutError--;
    return -1;
  } else {
    const html2 = fs.readFileSync(arg2, 'utf-8');
    const isEqual = !htmlCompare.compare(html1, html2).different;
    return isEqual;
  }


}

function tempfun(iterations, numFiles) {
  if(iterations == null) {
    let iterations = 10;
  }
  for(let i = 1; i <= iterations; i++) {
    let match = true;
    for(let j = 0; j < numFiles; j++) {
      let val = run("testing/html_snapshots/snapshot_orig_" + j + ".html", "testing/html_snapshots/snapshot_" + j + "_" + i + ".html");
      if(val === -1) {
        match = false;
        break;
      } else {
        match = val && match;
      }
    }
    if(match) count++;
    console.log("Iteration " + i + ":\n" + " match = " + match);
  }

}
