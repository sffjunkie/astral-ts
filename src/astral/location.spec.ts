const chai = require("chai");
const expect = chai.expect;
const assert = chai.assert;

import { LocationInfo } from "./index";
import { Location } from "./location";
import { IANAZone } from "luxon";

describe("Location", function() {
    describe("constructor", function() {
        it("Should return the default location if no info provided", function() {
            let loc = new Location();
            expect(loc.name).to.equal("Greenwich");
            expect(loc.region).to.equal("England");
            expect(loc.timezone).to.equal("Europe/London");
            expect(loc.latitude).to.be.closeTo(51.4733, 0.001);
            expect(loc.longitude).to.be.closeTo(-0.00083333, 0.000001);
        });

        it("Should accept a LocationInfo parameter", function() {
            let li = new LocationInfo(
                "A Place",
                "Somewhere",
                "Europe/Lisbon",
                1,
                2
            );
            let loc = new Location(li);
            expect(loc.name).to.equal("A Place");
            expect(loc.region).to.equal("Somewhere");
            expect(loc.timezone).to.equal("Europe/Lisbon");
            expect(loc.latitude).to.be.closeTo(1, 0.001);
            expect(loc.longitude).to.be.closeTo(2, 0.000001);
        });
    });

    describe("Properties", function() {
        describe("name", function() {
            it("Should return what is set", function() {
                let loc = new Location();
                loc.name = "Somewhere Else";
                expect(loc.location_info.name).to.equal("Somewhere Else");
                expect(loc.name).to.equal("Somewhere Else");
            });
        });
    });
    describe("region", function() {
        it("Should return what is set", function() {
            let loc = new Location();
            loc.region = "Up North";
            expect(loc.location_info.region).to.equal("Up North");
            expect(loc.region).to.equal("Up North");
        });
    });
    describe("timezone", function() {
        it("Should return what is set", function() {
            let loc = new Location();
            loc.timezone = "Europe/Lisbon";
            expect(loc.location_info.timezone).to.equal("Europe/Lisbon");
            expect(loc.timezone).to.equal("Europe/Lisbon");
        });
    });
    describe("latitude", function() {
        it("Should return what is set", function() {
            let loc = new Location();
            loc.latitude = 1;
            expect(loc.location_info.latitude).to.equal(1);
            expect(loc.latitude).to.equal(1);
        });
        it("Should accept a number as a string", function() {
            let loc = new Location();
            loc.latitude = "1";
            expect(loc.location_info.latitude).to.equal(1);
            expect(loc.latitude).to.equal(1);
        });
        it("Should accept a string of degrees minutes and seconds", function() {
            let loc = new Location();
            loc.latitude = "1°30'30\"E";
            expect(loc.location_info.latitude).to.be.closeTo(1.5083333333333333333333333333333, 0.00001);
            expect(loc.latitude).to.be.closeTo(1.5083333333333333333333333333333, 0.00001);
        });
    });
    describe("longitude", function() {
        it("Should return what is set", function() {
            let loc = new Location();
            loc.longitude = 1;
            expect(loc.location_info.longitude).to.equal(1);
            expect(loc.longitude).to.equal(1);
        });
        it("Should accept a number as a string", function() {
            let loc = new Location();
            loc.longitude = "1";
            expect(loc.location_info.longitude).to.equal(1);
            expect(loc.longitude).to.equal(1);
        });
        it("Should accept a string of degrees minutes and seconds", function() {
            let loc = new Location();
            loc.longitude = "1°30'30\"N";
            expect(loc.location_info.longitude).to.be.closeTo(1.508333333333, 0.00001);
            expect(loc.longitude).to.be.closeTo(1.508333333333, 0.00001);
        });
    });
    describe("tzinfo", function() {
        it("Should return a IANAZone based on timezone", function() {
            let loc = new Location();
            expect(loc.tzinfo.equals(new IANAZone("Europe/London"))).to.be.true;
            expect(loc.tzinfo.equals(new IANAZone("Europe/Lisbon"))).to.not.be.true;
        });
    });
    describe("observer", function() {
        it("Should return an Observer", function() {
            let loc = new Location();
            let obs = loc.observer;
            expect(obs.latitude).to.equal(51.4733);
            expect(obs.longitude).to.equal(-0.00083333);
            expect(obs.elevation).to.equal(0);
        });
    });
});
