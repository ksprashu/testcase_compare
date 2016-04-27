var request = require('request');
var expect = require('chai').expect
const CONFIG = require('./config.json');

var getRandomToken = function() {
    return Math.random().toString(10).substr(2, 4);
};

describe('Scenario to add a product to wishlist', function() {
    var accessToken;
    var productObject;
    var productId;
    var wishlistName = 'wishlistName_' + getRandomToken();

    before('get an access token', function(done) {
        var options = {
            uri: 'https://' + CONFIG.basePath + CONFIG.oauthPath + '/token',
            method: 'POST',
            headers: {
                Authorization: 'Basic ' + CONFIG.basicAuth,
                Accept: 'application/json'
            },
            form: {
                username: 'certification1',
                password: 'password1',
                grant_type: 'password'
            },
            json: true
        };

        request(options, function(err, response, data) {
            expect(response.statusCode).to.equal(200);
            accessToken = data.access_token;
            done();
        });
    });

    it('should create a wishlist', function(done) {
        var options = {
            uri: 'https://' + CONFIG.basePath + CONFIG.wishlistPath,
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json'
            },
            json: {
                name: wishlistName,
                displayName: 'my test mocha wishlist called ' + wishlistName
            }
        };

        request(options, function(err, response, data) {
            expect(response.statusCode).to.equal(201);
            done();
        });
    });

    it('should seach for black products', function(done) {
        var options = {
            uri: 'https://' + CONFIG.basePath + CONFIG.productsPath + '/search',
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json'
            },
            qs: {
                color: 'black'
            },
            json: true
        };

        request(options, function(err, response, data) {
            expect(response.statusCode).to.equal(200);
            productObject = data.products[0];
            done();
        });
    });

    it('should add black products to wishlist', function(done) {
        var options = {
            uri: 'https://' + CONFIG.basePath + CONFIG.wishlistPath + '/' + wishlistName + '/products',
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json'
            },
            json: {
                products: productObject
            }
        };

        request(options, function(err, response, data) {
            expect(response.statusCode).to.equal(200);
            done();
        });
    });

    it('should get wishlist details', function(done) {
        var options = {
            uri: 'https://' + CONFIG.basePath + CONFIG.wishlistPath + '/' + wishlistName,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json'
            },
            json: true
        };

        request(options, function(err, response, data) {
            expect(response.statusCode).to.equal(200);
            productId = data.wishlists[0].products[0].productId;
            done();
        });
    });

    it('should check for availability', function(done) {
        var options = {
            uri: 'https://' + CONFIG.basePath + CONFIG.productsPath + '/availability',
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + accessToken,
                Accept: 'application/json'
            },
            qs: {
                productid: productId,
                storeid: 203
            },
            json: true
        };

        request(options, function(err, response, data) {
            expect(response.statusCode).to.equal(200);
            expect(data.products[0].qty).to.equal(98);
            done();
        });
    });
});