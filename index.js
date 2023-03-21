import puppeteer from "puppeteer";

const sleep = (n = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), n);
  });
};
const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.goto(
    "https://www.ch-edoc-reservation.admin.ch/#/session?token=TPWHQjnK&locale=en-US",
    {
      waitUntil: "networkidle0",
    }
  );

  await page.setViewport({ width: 1728, height: 911 });

  await page.waitForSelector("#rebookBtn", { visible: true });
  await page.click("#rebookBtn");
  await sleep();

  await page.waitForSelector("#bookingListBtn", { visible: true });
  await page.click("#bookingListBtn");
  await sleep();

  const firstRowEL = await page.waitForSelector(
    "#content > app-booking-search > app-proposal-table > div > table > tbody > tr > td.mat-cell.cdk-cell.cdk-column-proposalDate.mat-column-proposalDate.ng-star-inserted"
  );
  const cellText = await firstRowEL.evaluate((el) => {
    const text = el.textContent;
    return text;
  });
  if (cellText) {
    const month = cellText.split(".")[2];
    console.info(`找到date了 ${cellText}`);
    if (month < 6) {
      console.info(`找到小于6月的date了 ${cellText}`);
      await page.click(
        ".ng-star-inserted > .mat-table > tbody > .mat-row:nth-child(1) > .cdk-column-proposalDate"
      );

      await page.waitForSelector("#rebookBtn", { visible: true });
      await page.click("#rebookBtn");
      console.info(`成功rebook ${cellText}`);
      await browser.close();
    }
  } else {
    console.info(`没有找到任何date`);
  }
  await browser.close();
};

main();
setInterval(() => {
  main();
}, 30 * 60 * 1000);
