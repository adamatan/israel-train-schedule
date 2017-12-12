#!/usr/bin/env node

const puppeteer = require('puppeteer');
const util = require('util');

const date = new Date();
const dateStr = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
const originStation = 4600;
const destinationStation = 5900;

const URL = `https://www.rail.co.il/en/pages/trainsearchres.aspx?FSID=${originStation}&TSID=${destinationStation}&Date=${dateStr}&Hour=0000&IOT=true&IBA=false`;
const regex = /departure\stime\s+([\d:]+)[\s\S]*arrival\stime\s+([\d:]+)[\s\S]*Platform\s+(\S+)[\s\S]*Duration\s([\d:]+)/m;

function parseLine(line) {
  const parsed = regex.exec(line);
  if (parsed) {
    return { departure: parsed[1], arrival: parsed[2], platform: parsed[3], duration: parsed[4] };
  }
  return {};
}

function formatLine(line) {
  return util.format('%s-%s (%s)', line.departure, line.arrival, line.duration);
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);
  const lines = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('.trainBasicInfo'));
    return anchors.map(anchor => anchor.textContent);
  });

  const departures = Array.from(new Set(lines.map(line => formatLine(parseLine(line)))));
  departures.sort();
  let i;
  for (i = 0; i < departures.length; i += 1) {
    console.log(departures[i]);
  }
  await browser.close();
})();
