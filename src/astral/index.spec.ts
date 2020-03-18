const assert = require("assert");
const expect = require("chai").expect;

import { dmsToNumber } from "./index";

describe("Test Misc functions", function() {
    describe("dmsToNumber", function() {
        it("return a float when passed a float", function() {
            expect(dmsToNumber(20.1)).to.equal(20.1);
        });

        it("return a float when passed a float encoded as a string", function() {
            expect(dmsToNumber("20.1")).to.equal(20.1);
        });

        it("return a valid float when using a whole number of degrees", function() {
            expect(dmsToNumber("24°", 90)).to.be.closeTo(24, 0.1);
        });

        it("return a valid float when using North", function() {
            expect(dmsToNumber("24°28'N", 90)).to.be.closeTo(24.466666, 0.1);
        });

        it("return a valid float when using East", function() {
            expect(dmsToNumber("54°22'E", 180.0)).to.be.closeTo(
                54.366666,
                0.00001
            );
        });

        it("return a valid float when using South", function() {
            expect(dmsToNumber("37°58'S", 90.0)).to.be.closeTo(
                -37.966666,
                0.00001
            );
        });

        it("return a valid float when using West", function() {
            expect(dmsToNumber("171°50'W", 180.0)).to.be.closeTo(
                -171.8333333,
                0.00001
            );
        });

        it("return a valid float when using lower case directions", function() {
            expect(dmsToNumber("171°50'w", 180.0)).to.be.closeTo(
                
                -171.8333333,
                0.00001
            );
        });

        it("be clamped to a limit if one is provided", function() {
            expect(dmsToNumber("180°50'w", 180.0)).to.equal(-180);
        });
    });
});
