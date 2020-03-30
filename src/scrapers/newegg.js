const chromium = require('chrome-aws-lambda');

module.exports = {
  host: 'newegg.com',

  scrape: async (url, browserWSEndpoint) => {
let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.connect({browserWSEndpoint});

    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'networkidle2',
    });
        result = await page.evaluate(function() {
          const allPriceDomSelectors = ['.price-main-product > li.price-current'];

          const priceDomSelector = allPriceDomSelectors.find(
            selector => document.querySelector(selector)
          );

          const priceDomRef = document.querySelector(priceDomSelector);
          const priceHtml = priceDomRef.innerHTML;

          const priceStr = priceHtml.replace(/(<([^>]+)>)/g, '').replace(/&nbsp;/g,'').replace(/,/g, '').replace(/\s/, '').replace(/\$/, '');

          const newegg = Number(priceStr);

          return Promise.resolve({
            newegg,
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
    const asin = url.match('/([a-zA-Z0-9]{15})(?:[/?]|$)/');
    if (asin && asin[1]) {
      return `http://www.newegg.com/p/${asin[1]}`;
    }
    return url;
  }
}
