'use strict';
const request = require('request');
const scrape = require('./src/scrapers');
const qs = require('querystring');
const db = require('./src/db');

module.exports.pathfinder = (event, context) => {
  console.log("event.body: " + event.body);
  const data = JSON.parse(event.body);
  const { uuid, seller, url } = data;

  const returnedPrices = {
    prices: {},
  };

  scrape(url,seller).then(function (scrapedInfo) {
    Object.assign(returnedPrices.prices, scrapedInfo);

    console.log("scrapedInfo: " + scrapedInfo.toString());
    console.log("returnedInfo: " + JSON.stringify(returnedPrices));

    var dataDone = db.collection('prices').doc(uuid).set(returnedPrices, {merge:true});

    dataDone.then(function () {
      return context.succeed("Done");
    });
  });
}

module.exports.crawl = (event, context) => {
  const productInfo = JSON.parse(event.body);
  console.log("productInfo: " + JSON.stringify(productInfo));
  const { uuid, urls } = productInfo;

  const pathfinderPromises = [];

  for (let [key, value] of Object.entries(urls)) {
      if (!!value) {
        console.log("Request imminent!");
        request({
          url: `${process.env.LAMBDA_ENDPOINT}/dev/pathfinder`,
          method: 'POST',
          body: {
            uuid: uuid,
            seller: key,
            url: value,
          },
          json: true,
          headers: {
            "Content-type": "application/json",
          },
        });
      }
  }
}

module.exports.run = (event, context) => {
  db.collection('links').get().then((querySnapshot) => {
    const data = [];
    querySnapshot.forEach(doc => {

      request({
        url: `${process.env.LAMBDA_ENDPOINT}/dev/crawl`,
        method: 'POST',
        json: Object.assign({}, doc.data()),
        headers: {
          "Content-type": "application/json",
        },
      });
    });

    return context.succeed("Done");

  //   res.json({ message: 'Crawling all products' });
  // }).catch(e => {
  //   res.status(500).json({ message: 'Something went wrong ', error: e });
  })
}
