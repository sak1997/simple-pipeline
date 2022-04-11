const fs = require('fs');
const HtmlDiffer = require('html-differ').HtmlDiffer;
var logger = require('html-differ/lib/logger');

const [, , ...args] = process.argv;
const html1 = fs.readFileSync(args[0], 'utf-8');
const html2 = fs.readFileSync(args[1], 'utf-8');

const options = {
  ignoreAttributes: [],
  compareAttributesAsJSON: [],
  ignoreWhitespaces: true,
  ignoreComments: true,
  ignoreEndTags: false
};

const htmlDiffer = new HtmlDiffer(options);

async function run() {
  const diff = await htmlDiffer.diffHtml(html2, html1);
  const isEqual = await htmlDiffer.isEqual(html1, html2);
 const res = logger.getDiffText(diff, { charsAroundDiff: 40 });

logger.logDiffText(diff, { charsAroundDiff: 40 });

}

run();