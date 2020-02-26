const assert = require("assert");
const chai = require("chai");
import * as geocoder from "../astral/geocoder";

describe("Test geocoder functions", function() {
    describe("database", function() {
        it("Should be able to create a new database", function() {
            geocoder.database();
        });
    });
    describe("lookup", function() {
        it("Should be able to find a location", function() {
            let loc = geocoder.lookup("london", geocoder.database());
            chai.assert.isNotNull(loc);
        });
    });
});
