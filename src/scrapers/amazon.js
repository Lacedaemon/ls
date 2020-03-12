const { Chromeless } = require('chromeless');

module.exports = {
  host: 'amazon.com',

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

          // if (priceDomRef.id === 'kindle_meta_binding_winner') {

          // }

          const priceStr = priceHtml.replace(/<span[\s\S]*?<\/span>/g, '').replace(/,/g, '').replace(/\s/, '').replace(/\$/, '');

          const price = Number(priceStr);

          return Promise.resolve({
            //name,
            price,
            //image,
            //seller: 'amazon',
          });
        } catch (e) {
          return Promise.reject(e);
        }
      })
      .end();
  },

  normalize: (url) => {
    const asin = url.match('/([a-zA-Z0-9]{10})(?:[/?]|$)/');
    if (asin && asin[1]) {
      return `http://www.amazon.com/dp/${asin[1]}`;
    }
    return url;
  }
}
