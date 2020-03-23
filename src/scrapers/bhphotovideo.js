const chromium = require('chrome-aws-lambda');

module.exports = {
  host: 'bhphotovideo.com',
  seller: 'bhphotovideo',

  scrape: async (url) => {
    let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      // args: chromium.args,
      // defaultViewport: chromium.defaultViewport,
      // executablePath: await chromium.executablePath,
    executablePath: "google-chrome",
      // headless: chromium.headless,
      headless: true,
    });

    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'networkidle2',
    });
        result = await page.evaluate(function() {
        const allPriceDomSelectors = ['div[data-selenium=pricingPrice]'];

        const priceDomSelector = allPriceDomSelectors.find(
          selector => document.querySelector(selector)
        );

        const priceDomRef = document.querySelector(priceDomSelector);
        const priceHtml = priceDomRef.innerHTML;

        const priceStr = priceHtml.replace(/(<([^>]+)>)/g, '').replace(/,/g, '').replace(/\s/, '').replace(/\$/, '');

          const bhphotovideo = Number(priceStr);

          return Promise.resolve({
            bhphotovideo,
          });
        });

    } catch (error) {
        result = Promise.reject(error);
    } finally {
        if (browser !== null) {
                await browser.close();
        }
    }
        return result;
  },

  normalize: (url) => {
    const asin = url.match('/([0-9]{7}-REG)(?:[/?]|$)/');
    if (asin && asin[1]) {
      return `https://www.bhphotovideo.com/c/product/${asin[1]}`;
    }
    return url;
  }
}
