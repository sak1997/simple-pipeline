const { CONNREFUSED } = require('dns');
const fs = require('fs');
const HtmlDiffer = require('html-differ').HtmlDiffer;
var logger = require('html-differ/lib/logger');

const [, , ...args] = process.argv;
const options = {
  ignoreAttributes: [],
  compareAttributesAsJSON: [],
  ignoreWhitespaces: true,
  ignoreComments: true,
  ignoreEndTags: false
};

const htmlDiffer = new HtmlDiffer(options);
let count = 0;
let totalIterations = args[0];

tempfun(args[0], args[1]);

console.log("Mutation coverage: ");
console.log(count + " / " + totalIterations);
console.log("Number of compilation errors = " + (args[0] - totalIterations));

function run(arg1, arg2) {

  const html1 = fs.readFileSync(arg1, 'utf-8');
  if(!fs.existsSync(arg2)) {
    console.log("file " + arg2 + "not found - compilcation error! This case will NOT be considered in coverage");
    totalIterations--;
    return false;
  } else {
    const html2 = fs.readFileSync(arg2, 'utf-8');
    const diff = htmlDiffer.diffHtml(html2, html1);
    const isEqual = htmlDiffer.isEqual(html1, html2);
    const res = logger.getDiffText(diff, { charsAroundDiff: 40 });
    logger.logDiffText(diff, { charsAroundDiff: 40 });
    // console.log(isEqual);
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
      match = match && run("testing/html_snapshots/snapshot_orig_" + j + ".html", "testing/html_snapshots/snapshot_" + j + "_" + i + ".html");
    }
    if(match) count++;
    console.log("iteration " + i + " match = " + match);
  }

}
//          match = match && run("html_snapshots/snapshot" + (j + 1) + "_1.html", "html_snapshots/snapshot" + (j + 1) + "_" + i + ".html");
//       match = match && run("testing/html_snapshots/snapshot_orig_" + j + ".html", "testing/html_snapshots/snapshot_" + j + "_" + i + ".html");
