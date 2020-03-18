const rewire = require("rewire");
const assert = require("assert");
const expect = require("chai").expect;
const geocoder = rewire("../astral/geocoder");

let test_db = geocoder.database();

function locationCount(db) {
    let count = 0;
    for (const loc of geocoder.allLocations(db)) {
        count++;
    }
    return count;
}

describe("Test geocoder functions", function() {
    describe("database", function() {
        it("create a new database", function() {
            let db = geocoder.database();
            expect(Object.keys(db).length).to.equal(12);
        });
    });

    describe("lookup", function() {
        it("find a group", function() {
            let group = geocoder.group("asia", test_db);
            expect(group).to.not.be.null;
            expect(Object.values(group).length).to.be.above(0);
        });

        it("find a location", function() {
            let loc = geocoder.location("london", test_db);
            expect(loc).to.not.be.null;
            expect(loc.name).to.equal("London");
            expect(loc.region).to.equal("England");
            expect(loc.latitude).to.be.closeTo(51.4733, 0.001);
            expect(loc.longitude).to.be.closeTo(-0.0008333, 0.000001);
            expect(loc.timezone).to.equal("Europe/London");
        });

        it("find a location with a region", function() {
            let loc = geocoder.location("Birmingham,England", test_db);
            expect(loc).to.not.be.null;
            expect(loc.name).to.equal("Birmingham");
            expect(loc.region).to.equal("England");

            loc = geocoder.location("Birmingham,USA", test_db);
            expect(loc).to.not.be.null;
            expect(loc.name).to.equal("Birmingham");
            expect(loc.region).to.equal("USA");
        });

        it("not be able to find a location not in the db", function() {
            expect(function() {
                geocoder.location("somewhere", test_db);
            }).to.throw();
        });
    });

    describe("allLocations", function() {
        it("All locations have a name", function() {
            let db = geocoder.database();
            for (const loc of geocoder.allLocations(db)) {
                expect(loc.name).to.not.be.null;
            }
        });
    });

    describe("adding to the database", function() {
        it("only add one location for a string with a newline at the end", function() {
            let db = geocoder.database();
            let count = locationCount(db);
            geocoder.addLocations(
                "A Place,A Region,Asia/Nicosia,35°10'N,33°25'E,162.0\n",
                db
            );
            expect(locationCount(db)).to.equal(count + 1);
        });

        it("be able to add a array of strings", function() {
            let db = geocoder.database();
            let count = locationCount(db);
            geocoder.addLocations(
                [
                    "A Place,A Region,Asia/Nicosia,35°10'N,33°25'E,162.0",
                    "Another Place,Somewhere else,Asia/Nicosia,35°10'N,33°25'E,162.0"
                ],
                db
            );
            expect(locationCount(db)).to.equal(count + 2);
        });

        it("be able to add a array of arrays", function() {
            let db = geocoder.database();
            let count = locationCount(db);
            geocoder.addLocations(
                [
                    [
                        "A Place",
                        "A Region",
                        "Asia/Nicosia",
                        "35°10'N",
                        "33°25'E",
                        "162.0"
                    ],
                    [
                        "Another Place",
                        "Somewhere else",
                        "Asia/Nicosia",
                        "35°10'N",
                        "33°25'E",
                        "162.0"
                    ]
                ],
                db
            );
            expect(locationCount(db)).to.equal(count + 2);
        });
    });

    describe("sanitize_key", function() {
        it("sanitize a key", function() {
            let func = geocoder.__get__("_sanitize_key");
            expect(func("Los Angeles")).to.equal("los_angeles");
        });
    });
});
