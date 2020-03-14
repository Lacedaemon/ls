const { Chromeless } = require('chromeless');

module.exports = {
  host: 'bhphotovideo.com',

  scrape: (url) => {
    //const chromeless = new Chromeless({
    //  remote: {
    //    apiKey: process.env.CHROMELESS_API_KEY,
    //    endpointUrl: process.env.CHROMELESS_ENDPOINT,
    //  }
    //});

    const chromeless = new Chromeless();

    return chromeless
      //.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36")
      //.setViewport({ width: 990, height: 400, scale: 1 })
      .goto(url)
      .evaluate(function () {
        try {
          const allPriceDomSelectors = ['div[data-selenium=pricingPrice]'];

          /**
           * get price
           */
          const priceDomSelector = allPriceDomSelectors.find(
            selector => document.querySelector(selector)
          );

          const priceDomRef = document.querySelector(priceDomSelector);
          const priceHtml = priceDomRef.innerHTML;

          const priceStr = priceHtml.replace(/(<([^>]+)>)/g, '').replace(/,/g, '').replace(/\s/, '').replace(/\$/, '');

          const price = Number(priceStr);

          return Promise.resolve({
            price,
          });
        } catch (e) {
          return Promise.reject(e);
        }
      })
      .end();
  },

  normalize: (url) => {
    const asin = url.match('/([0-9]{7}-REG)(?:[/?]|$)/');
    if (asin && asin[1]) {
      return `https://www.bhphotovideo.com/c/product/${asin[1]}`;
    }
    return url;
  }
}
