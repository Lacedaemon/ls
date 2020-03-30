'use strict';
const request = require('request');
const scrape = require('./src/scrapers');
const qs = require('querystring');
const db = require('./src/db');

const chromium = require('chrome-aws-lambda');

// LOCAL RUN ONLY

// const crawl = function(dbData,callback) {
//   const productInfo = dbData;
//   console.log(productInfo);
//   const { uuid, urls } = productInfo;
//   const returnedPrices = {
//     //uuid: "",
//     prices: {},
//   };
//
//   //returnedPrices['uuid'] = productInfo.uuid;
//
//   const pricePromises = [];
//
//   for (let [key, value] of Object.entries(productInfo.urls)) {
//     const promise = new Promise((resolve) => {
//         if (!!value) {
//         scrape(value, key)
//           .then(function (scrapedInfo) {
//             console.log(scrapedInfo);
//             Object.assign(returnedPrices.prices, scrapedInfo);
//             resolve();
//             //callback(null, scrapedInfo);
//           })
//           .catch(function (e) {
//             var emptyURL = [];
//             emptyURL[key] = '';
//             console.log(emptyURL);
//             Object.assign(returnedPrices.prices, emptyURL);
//             resolve();
//           });
//       } else {
//         var emptyURL = [];
//         emptyURL[key] = '';
//         console.log(emptyURL);
//         Object.assign(returnedPrices.prices, emptyURL);
//         resolve();
//       }
//
//     })
//     pricePromises.push(promise);
//   }
//
//   Promise.all(pricePromises).then(() => {
//     console.log(returnedPrices);
//
//     db.collection('prices').doc(productInfo.uuid).set(returnedPrices);
//   })
// }

module.exports.crawl = async (event, context, callback) => {
  const productInfo = JSON.parse(event.body);
  console.log(productInfo);
  const { uuid, urls } = productInfo;
  const returnedPrices = {
    //uuid: "",
    prices: {},
  };

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
  // executablePath: "google-chrome",
    headless: chromium.headless,
    // headless: true,
  });

  const browserWSEndpoint = await browser.wsEndpoint();

  //returnedPrices['uuid'] = productInfo.uuid;

  const pricePromises = [];

  for (let [key, value] of Object.entries(productInfo.urls)) {
    const promise = new Promise((resolve) => {
        if (!!value) {
        scrape(value, key, browserWSEndpoint)
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

    browser.close();

    db.collection('prices').doc(productInfo.uuid).set(returnedPrices, {merge:true});

    return context.succeed("Done");
  })
}

module.exports.run = (event, context) => {
  db.collection('links').get().then((querySnapshot) => {
    const data = [];
    querySnapshot.forEach(doc => {
      // Local run only
      // crawl(Object.assign({}, doc.data()));

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
