require("dotenv").config();
const puppeteer = require("puppeteer");
const { KnownDevices } = require("puppeteer");
const iPhone = KnownDevices["iPhone 6"];

const main = async (address) => {
  
  try{

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--window-size=1300,700",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
    ],
  });
  const page = await browser.newPage({ timeout: 60000 });
  await page.emulate(iPhone);

  // await page.setViewport({ width: 1300, height: 700 });

  await page.goto("https://faucet.matic.network/");

  await page.waitForSelector(
    'input[placeholder="0xxxxxxxxxxxxxxxxxxxxxxxxxxx"]');

  await page.type('input[placeholder="0xxxxxxxxxxxxxxxxxxxxxxxxxxx"]', address);

  await page.click(".btn-loader.buttonloader .btn.btn-primary.btn-block");
  console.log("it ran");
  

  await page.waitForSelector(
    ".ps-t-12 .btn-loader.buttonloader.mx-auto .btn.btn-primary.btn-block");

    await page.click(
      ".ps-t-12 .btn-loader.buttonloader.mx-auto .btn.btn-primary.btn-block"
      );


    await page.waitForResponse((response) =>
      response.url() ===
      "https://faucet.polygon.technology/img/failed.06a0a36e.png"
      ? 
      // page.screenshot({ path: "error.png" })
      console.log("matic not given")
      : console.log("success")
      );
    // console.log("success");
    await page.close();


    }catch(e){console.log(`waiting time to fetch tokens`)}

};


module.exports = main;