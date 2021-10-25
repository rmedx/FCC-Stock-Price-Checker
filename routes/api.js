'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;
const axios = require('axios');

module.exports = function (app) {
  const url = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'

  const db = mongoose.connect(process.env.DB)

  const stockSchema = new Schema({
    tickerSymbol: {type: String, required: true},
    likes: [String]
  })

  let Stock = mongoose.model("Stock", stockSchema);

  app.route('/api/stock-prices')
    .get(function (req, res){
      let like = req.query.like;
      let ip = req.ip;
      if (typeof req.query.stock == "string") {
        let input_symbol = req.query.stock;
        let url2 = url + input_symbol + "/quote";
        axios
          .get(url2)
          .then(response => {
            let symbol = response.data.symbol;
            if (!symbol) {
              console.log("invalid symbol");
            }
            let price = response.data.latestPrice;
            Stock.find({"tickerSymbol": symbol}, (err, docs) => {
              if (err) {
                console.log("error finding stock in db");
              }
              let likes;
              // no stock exists so make one and add a like if like is true
              if (docs.length == 0) {
                const newStock = new Stock({"tickerSymbol": symbol, "likes": []});
                if (like == "true") {
                  newStock.likes.push(ip);
                  likes = 1;
                } else {
                  likes = 0;
                }
                newStock.save((err, data) => {
                  if (err) {
                    console.log("error saving new stock to db");
                  }
                })
              } else { // stock exists and add a like if like is true
                const stockToUpdate = docs[0];
                if (like == "true" && !stockToUpdate.likes.includes(ip)) {
                  stockToUpdate.likes.push(ip);
                  stockToUpdate.save((err, data) => {
                    if (err) {
                      console.log("error saving stockToUpdate to db");
                    }
                  })
                  likes = stockToUpdate.likes.length;
                } else {
                  likes = stockToUpdate.likes.length;
                }
              }
              let result = {"stockData":{"stock":symbol,"price":price,"likes":likes}};
              return res.send(result);
            })
          })
          .catch(err => console.log(err));
      } else {
        let inputSymbolA = req.query.stock[0];
        let inputSymbolB = req.query.stock[1];
        let urlA = url + inputSymbolA + "/quote";
        let urlB = url + inputSymbolB + "/quote";
        axios
          .get(urlA)
          .then(responseA => {
            let symbolA = responseA.data.symbol;
            if (!symbolA) {
              console.log("invalid symbol first stock");
            }
            let priceA = responseA.data.latestPrice;
            axios.get(urlB)
              .then(responseB => {
                let symbolB = responseB.data.symbol;
                if(!symbolB) {
                  console.log("invalid symbol second stock");
                }
                let priceB = responseB.data.latestPrice;
                Stock.find({"tickerSymbol": symbolA}, (err, docsA) => {
                  if (err) {
                    console.log("error finding symbolA");
                  }
                  if (docsA.length == 0) {
                    const newStockA = new Stock({"tickerSymbol": symbolA, "likes": []});
                    if (like == "true") {
                      newStockA.likes.push(ip);
                    }
                    newStockA.save((err, docs) => {
                      if (err) {
                        console.log("couldnt save newStockA")
                      }
                    });
                  }
                  Stock.find({"tickerSymbol": symbolB}, (err, docsB) => {
                    if (err) {
                      console.log("error finding symbolV")
                    }
                    if (docsB.length == 0) {
                      const newStockB = new Stock({"tickerSymbol": symbolB, "likes": []});
                      if (like == "true") {
                        newStockB.likes.push(ip);
                      }
                      newStockB.save((err, docs) => {
                        if (err) {
                          console.log("error saving newStockB")
                        }
                      });
                    }
                    let relA;
                    let relB;
                    if (like == "false") { // like is false
                      let likesA = (docsA.length == 1) ? docsA[0].likes.length : 0;
                      let likesB = (docsB.length == 1) ? docsB[0].likes.length : 0;
                      relA = likesA - likesB;
                      relB = likesB - likesA;
                    } else { // like is true
                      let stockA = docsA[0];
                      let likesA = (docsA.length == 1) ? docsA[0].likes.length : 0;
                      let stockB = docsB[0];
                      let likesB = (docsA.length == 1) ? docsB[0].likes.length : 0;
                      if (!stockA.likes.includes(ip)) {
                        stockA.likes.push(ip);
                        stockA.save((err, docs) => {
                          if (err) {
                            console.log("error saving stockA");
                          }
                        })
                        likesA += 1;
                      }
                      if (!stockB.likes.includes(ip)) {
                        stockB.likes.push(ip);
                        stockB.save((err, docs) => {
                          if (err) {
                            console.log("error saving stockB");
                          }
                        })
                        likesB += 1;
                      }
                      relA = likesA - likesB;
                      relB = likesB - likesA;
                    }
                    return res.send({"stockData":[{"stock":symbolA,"price":priceA,"rel_likes":relA},{"stock":symbolB,"price":priceB,"rel_likes":relB}]})
                  })
                })
              })
              .catch(err => console.log(err));
          })
          .catch(err => console.log(err));
      }
    });
    
};
