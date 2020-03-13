const chromium = require('chrome-aws-lambda');

module.exports = {
  host: 'amazon.com',

  scrape: async (url) => {
	let result = null;
  let browser = null;

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    await page.goto(url);
    //await page.waitForSelector("#priceblock_ourprice");

    result = await page.evaluate(function () {
          const allPriceDomSelectors = ['#priceblock_dealprice', '#priceblock_ourprice',
            '#priceblock_saleprice', '#buyingPriceValue', '#actualPriceValue',
            '#priceBlock', '#price', '#buyNewSection .offer-price'];

          /**
           * get price
           */
          const priceDomSelector = allPriceDomSelectors.find(
            selector => document.querySelector(selector)
          );

          const priceDomRef = document.querySelector(priceDomSelector);
          const priceHtml = priceDomRef.innerHTML;

          const priceStr = priceHtml.replace(/<span[\s\S]*?<\/span>/g, '').replace(/,/g, '').replace(/\s/, '').replace(/\$/, '');

          const price = Number(priceStr);

          return price
	});
    if (browser !== null) {
      await browser.close();
    }

  console.log('Result:' + result);

  return result;
  },

  normalize: (url) => {
    const asin = url.match('/([a-zA-Z0-9]{10})(?:[/?]|$)/');
    if (asin && asin[1]) {
      return `http://www.amazon.com/dp/${asin[1]}`;
    }
    return url;
  }
}
