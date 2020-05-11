'use strict'
const handler = require('./handler')
const rp = require('request-promise-native');

// handler.add({
//   body: "url=https%3A%2F%2Fwww.amazon.com%2FIntel-i9-10900X-Desktop-Processor-Unlocked%2Fdp%2FB07YP69HTM"
//   //body: "url=https%3A%2F%2Fwww.newegg.com%2Famd-ryzen-5-3600%2Fp%2FN82E16819113569"
//   //body: "url=https://www.bhphotovideo.com/c/product/1485462-REG/amd_100_100000031box_ryzen_5_3600_3_6.html"
// }, null, (err, output) => {
//   console.log(output)
// })

// handler.crawl({
//   uuid: "zKrUwqTRzpGpKOIobHKa",
//   urls: {
//     amazon: "https://www.amazon.com/AMD-Ryzen-3600-12-Thread-Processor/dp/B07STGGQ18",
//     bhphotovideo: "https://www.bhphotovideo.com/c/product/1485462-REG",
//     newegg: "https://www.newegg.com/amd-ryzen-5-3600/p/N82E16819113569"
//   }})

// handler.run();
