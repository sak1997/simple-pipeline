#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs');

// Requires 2 directories in the same folder as the program - one called image_snapshots, another called html_snapshots
// run like this:
// node screenshot.js <URL> <snapshot name with no extension>

const [, , ...args] = process.argv;

(async () => {
  const url = args[0];
  // const filename = `./image_snapshots/${args[1]}.png`;
  // console.log(filename);
  const browser = await puppeteer.launch({
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  try {
    await page.goto(url, {
      waitUntil: 'networkidle0'
    })
  } catch(error) {
    console.log("found a case where there's a runtime error - page not loading at all!");
    await page.close();
    await browser.close();
  }

  // await page.screenshot({
  //   path: filename,
  //   fullPage: true
  // });

  let html = await page.content();
  fs.writeFileSync( `./html_snapshots/${args[1]}.html`, html);
  await page.close();
  await browser.close();
})();
