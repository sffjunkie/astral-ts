const expect = require("chai").expect;

import { LocationInfo } from "./index";

describe("LocationInfo", function() {
    describe("constructor", function() {
        it("should accept no parameters", function() {
            let li = new LocationInfo();
            expect(li.name).to.equal("Greenwich");
            expect(li.region).to.equal("England");
            expect(li.timezone).to.equal("Europe/London");
            expect(li.latitude).to.equal(51.4733);
            expect(li.longitude).to.equal(-0.0008333);
        });

        it("should fail on bad latitude", function() {
            expect(
                () =>
                    new LocationInfo(
                        "a place",
                        "somewhere",
                        "Europe/London",
                        "i",
                        2
                    )
            ).to.throw();
        });

        it("should fail on bad longitude", function() {
            expect(
                () =>
                    new LocationInfo(
                        "a place",
                        "somewhere",
                        "Europe/London",
                        2,
                        "i"
                    )
            ).to.throw();
        });
    });

    describe("fromObject", function() {
        it("should be able to constructed from an object", function() {
            let li = LocationInfo.fromObject({
                name: "A Place",
                region: "A Region",
                timezone: "Europe/London",
                latitude: 2,
                longitude: "171°50'W"
            });
            expect(li.name).to.equal("A Place");
            expect(li.region).to.equal("A Region");
            expect(li.timezone).to.equal("Europe/London");
            expect(li.latitude).to.equal(2);
            expect(li.longitude).to.be.closeTo(-171.833333, 0.0001);
        });
    });
});
