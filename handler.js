'use strict';
const request = require('request');
const scrape = require('./src/scrapers');
const qs = require('querystring');
// const db = require('./src/db');

const crawl = function(dbData, callback) {
  const productInfo = dbData;
  console.log(productInfo);
  const { uuid, urls } = productInfo;
  const returnedPrices = {
    uuid: "",
    prices: {},
  };

  returnedPrices['uuid'] = productInfo.uuid;

  for (let [key, value] of Object.entries(productInfo.urls)) {
    scrape(value, key)
      .then(function (scrapedInfo) {
        console.log(scrapedInfo);
        Object.assign(returnedPrices.prices, scrapedInfo);
        // add price data
        // console.log({ productInfo, scrapedInfo });
        // if (!scrapedInfo) {
        //   // something went wrong with scraping. lets try again
        //   // request({
        //   //   url: `${process.env.LAMBDA_ENDPOINT}/dev/crawl`,
        //   //   method: 'POST',
        //   //   json: productInfo,
        //   //   headers: {
        //   //     "Content-type": "application/json",
        //   //   },
        //   // });
        //
        //   return;
        // }
        //
        // const storedPrice = productInfo.price;
        // const scrapedPrice = scrapedInfo.price;
        //
        // if (storedPrice !== scrapedPrice) {
        //   db.collection('prices').doc(hash(productInfo.url)).update(
        //     Object.assign({}, productInfo, scrapedInfo)
        //   );
        //
        //   db.collection('prices').add({
        //     uuid: productInfo.id,
        //     price: scrapedPrice,
        //     created: new Date(),
        //   }).then(docRef => {
        //     res.json({ message: 'Successfully added to prices collection', ackId: docRef.id })
        //   }).catch(e => {
        //     res.status(500).json({ message: 'Something went wrong!', error: e });
        //   });
        //
        // } else {
        //   res.json({ message: 'Done, but nothing has really changed!' });
        // }
        console.log(returnedPrices);
        callback(null, scrapedInfo);
      })
      .catch(function (e) {
        // console.log('issues in crawl', e);
        // request({
        //   url: `${process.env.ZEIT_SERVER}/api/prices/${id}`,
        //   method: 'POST',
        //   json: {
        //     productInfo: productInfo,
        //   },
        //   headers: {
        //     "Content-type": "application/json",
        //   },
        // });
        //
        // callback(null, e);
      })
  }
}

module.exports.crawl = crawl;

module.exports.run = (event, context, callback) => {
  db.collection('links').get().then((querySnapshot) => {
    const data = [];
    querySnapshot.forEach(doc => {
      crawl(Object.assign({}, doc.data()));
    });

    res.json({ message: 'Crawling all products' });
  }).catch(e => {
    res.status(500).json({ message: 'Something went wrong ', error: e });
  })
}
