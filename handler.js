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

  const pricePromises = [];

  for (let [key, value] of Object.entries(productInfo.urls)) {
    const promise = new Promise((resolve) => {
        if (!!value) {
        scrape(value, key)
          .then(function (scrapedInfo) {
            console.log(scrapedInfo);
            Object.assign(returnedPrices.prices, scrapedInfo);
            resolve();
            //callback(null, scrapedInfo);
          })
          .catch(function (e) {
            var emptyURL = [];
            emptyURL[key] = '';
            console.log(emptyURL);
            Object.assign(returnedPrices.prices, emptyURL);
            resolve();
          });
      } else {
        var emptyURL = [];
        emptyURL[key] = '';
        console.log(emptyURL);
        Object.assign(returnedPrices.prices, emptyURL);
        resolve();
      }

    })
    pricePromises.push(promise);
  }

  Promise.all(pricePromises).then(() => {
    console.log(returnedPrices);

    // TO-DO: push to DB in this block
  })
}

module.exports.crawl = crawl;

module.exports.run = (event, context, callback) => {
  db.collection('links').get().then((querySnapshot) => {
    const data = [];
    querySnapshot.forEach(doc => {
      // TO-DO: invoke new lambda per crawl
      crawl(Object.assign({}, doc.data()));
    });

    res.json({ message: 'Crawling all products' });
  }).catch(e => {
    res.status(500).json({ message: 'Something went wrong ', error: e });
  })
}
