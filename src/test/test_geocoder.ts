const assert = require("assert");
const chai = require("chai");
import * as geocoder from "../astral/geocoder";

let test_db = geocoder.database();

describe("Test geocoder functions", function() {
    describe("database", function() {
        it("Should be able to create a new database", function() {
            let db = geocoder.database();
            chai.assert.isAbove(Object.keys(db).length, 1);
        });
    });

    describe("lookup", function() {
        it("Should be able to find a group", function() {
            let group = geocoder.lookup("asia", test_db);
            chai.assert.isNotNull(group);
            chai.assert.isAbove(Object.values(group).length, 1);
        });

        it("Should be able to find a location", function() {
            let loc = geocoder.lookup("london", test_db);
            chai.assert.isNotNull(loc);
            chai.assert.equal(loc.name, "London");
            chai.assert.equal(loc.region, "England");
            chai.assert.closeTo(loc.latitude, 51.4733, 0.001);
            chai.assert.closeTo(loc.longitude, -0.0008333, 0.000001);
            chai.assert.equal(loc.timezone, "Europe/London");
        });

        it("Should not be able to find a location not in the db", function() {
            let loc = geocoder.lookup("somewhere", test_db);
            chai.assert.isNull(loc);
        });

        it("Should be able to find a location with a region", function() {
            let loc = geocoder.lookup("Birmingham,England", test_db);
            chai.assert.isNotNull(loc);
            chai.assert.equal(loc.name, "Birmingham");
            chai.assert.equal(loc.region, "England");

            loc = geocoder.lookup("Birmingham,USA", test_db);
            chai.assert.isNotNull(loc);
            chai.assert.equal(loc.name, "Birmingham");
            chai.assert.equal(loc.region, "USA");
        });
    });

    describe("all_locations", function() {
        it("All locations should have a name", function() {
            let db =geocoder.database();
            for (const loc of geocoder.all_locations(db)) {
                chai.assert.isNotNull(loc.name);
            }
        });
    });
});
