const puppeteer = require('puppeteer');

const date = new Date();
const dateStr = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;

const URL = `https://www.rail.co.il/en/pages/trainsearchres.aspx?FSID=5900&TSID=4600&Date=${dateStr}&Hour=0000&IOT=true&IBA=false`;
const regex = /departure\stime\s+([\d:]+)[\s\S]*arrival\stime\s+([\d:]+)[\s\S]*Platform\s+(\S+)[\s\S]*Duration\s([\d:]+)/m;

function parseLine(line) {
  const parsed = regex.exec(line);
  if (parsed) {
    return { departure: parsed[1], arrival: parsed[2], platform: parsed[3], duration: parsed[4] };
  }
  return {};
}



(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);
  await page.screenshot({ path: 'screenshot.png' });
  const lines = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('.trainBasicInfo'));
    return anchors.map(anchor => anchor.textContent);
  });

  let i = 0;
  for (i = 0; i < lines.length; i++) {
    console.log(parseLine(lines[i]));
  }
  await browser.close();
})();
