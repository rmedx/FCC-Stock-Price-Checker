const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let counter;

suite('Functional Tests', function() {
    this.timeout(5000);
    // Viewing one stock: GET request to /api/stock-prices/
    test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
        chai
          .request(server)
          .get('/api/stock-prices?stock=GOOG')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body["stockData"]["stock"], "GOOG");
            done();
          })
    });
    // Viewing one stock and liking it: GET request to /api/stock-prices/
    test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
        chai
          .request(server)
          .get('/api/stock-prices?stock=GOOG&like=true')
          .end((err, res) => {
            counter = res.body.likes;
            assert.equal(res.status, 200);
            assert.equal(res.body["stockData"]["stock"], "GOOG");
            assert.notEqual(res.body.likes, 0);
            done();
          })
    });
    // Viewing the same stock and liking it again: GET request to /api/stock-prices/
    test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
        chai
          .request(server)
          .get('/api/stock-prices?stock=GOOG&like=true')
          .end((err, res) => {
            counter = res.body.likes;
            assert.equal(res.status, 200);
            assert.equal(res.body["stockData"]["stock"], "GOOG");
            assert.equal(res.body.likes, counter);
            done();
          })
    });
    // Viewing two stocks: GET request to /api/stock-prices/
    test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
        chai
          .request(server)
          .get('/api/stock-prices?stock=AAPL&stock=MSFT')
          .end((err, res) => {
            counter = res.body.likes;
            assert.equal(res.status, 200);
            assert.equal(res.body["stockData"][0]["stock"], "AAPL");
            assert.equal(res.body["stockData"][1]["stock"], "MSFT");
            done();
          })
    });
    // Viewing two stocks and liking them: GET request to /api/stock-prices/
    test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
        chai
          .request(server)
          .get('/api/stock-prices?stock=AAPL&stock=MSFT&like=true')
          .end((err, res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body["stockData"][0]["stock"], "AAPL");
            assert.equal(res.body["stockData"][1]["stock"], "MSFT");
            done();
          })
    });
});
