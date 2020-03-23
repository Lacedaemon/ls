const chromium = require('chrome-aws-lambda');

module.exports = {
  host: 'amazon.com',

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

          const amazon = Number(priceStr);

          return Promise.resolve({amazon,});
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
    const asin = url.match('/([a-zA-Z0-9]{10})(?:[/?]|$)/');
    if (asin && asin[1]) {
      return `https://www.amazon.com/dp/${asin[1]}`;
    }
    return url;
  }
}
