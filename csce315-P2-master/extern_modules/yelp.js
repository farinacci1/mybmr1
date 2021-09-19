'use strict';
var yelpApi = require('yelp-fusion');
class YelpClient {
    constructor(ap) {
        this.client = yelpApi.client(ap);
    }
    search(terms, lat, long, price, distance, sort) {
        return this.client.search({ term: terms, latitude: lat, longitude: long, price: price, radius: distance, sort_by: sort });
    }
}
var Key = 'x8eFCuh2pLz-CPrFBX3okI0N3cRlekNw35iQBrSDRWaCTwqTaazaDgePYjyg6WdkTOxnbuhpber_ZaJVhS1qjXEiDq9z43_6kqg1kNqA_HaOKHaEcrfsYD7OTUSFXnYx';
const Client = new YelpClient(Key);

module.exports = Client;


