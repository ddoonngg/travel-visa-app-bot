import puppeteer from "puppeteer";

const sleep = (n = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), n);
  });
};

/**
 *
 * @param {string} url url of rebook
 */
const book = async (url) => {
  const browser = await puppeteer.launch({
    headless: false,
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  await page.setViewport({ width: 1728, height: 911 });

  const currentDateCell = await page.waitForSelector(
    "#content > app-appointment-detail > section:nth-child(2) > div > ul > li:nth-child(6) > span:nth-child(2)",
    { visible: true }
  );
  const currentDateString = await currentDateCell.evaluate(
    (el) => el.textContent
  );
  const curMonth = currentDateString.split(".")[2];
  const curDate = currentDateString.split(".")[1];
  console.log({ curMonth, curDate });
  await page.waitForSelector("#rebookBtn", { visible: true });
  await page.click("#rebookBtn");
  await sleep();

  await page.waitForSelector("#bookingListBtn", { visible: true });
  await page.click("#bookingListBtn");
  await sleep();

  const firstRowEL = await page.waitForSelector(
    "#content > app-booking-search > app-proposal-table > div > table > tbody > tr > td.mat-cell.cdk-cell.cdk-column-proposalDate.mat-column-proposalDate.ng-star-inserted",
    { visible: true }
  );
  const cellText = await firstRowEL.evaluate((el) => {
    const text = el.textContent;
    return text;
  });
  if (cellText) {
    const month = cellText.split(".")[2];
    const date = cellText.split(".")[1];
    console.info(`Found date: ${cellText} at ${new Date().toLocaleTimeString()}`);
    if (month < curMonth || (month === curMonth && date < curDate)) {
      console.info(
        `Found ${curMonth}/${curDate} ${cellText} at ${new Date().toLocaleTimeString()}`
      );
      await page.click(
        ".ng-star-inserted > .mat-table > tbody > .mat-row:nth-child(1) > .cdk-column-proposalDate"
      );

      await page.waitForSelector("#rebookBtn", { visible: true });
      await page.click("#rebookBtn");
      console.info(`Rebook ${cellText} ${new Date().toLocaleTimeString()}`);
      await browser.close();
    }
  } else {
    console.info(`No date found at ${new Date().toLocaleTimeString()}`);
  }
  await browser.close();
};

const main = async () => {
  const urls = ["url1", "url2"];
  for (const url of urls) {
    await book(url);
  }
};

main();
setInterval(() => {
  main();
}, 30 * 60 * 1000);
