const assert = require("assert");
const chai = require("chai");
chai.use(require('chai-datetime'));

import { dms_to_float } from "../astral/index";

describe("Test Misc functions", function() {
    describe("dms_to_float", function() {
        it("should return a float when passed a float", function() {
            assert.equal(dms_to_float(20.1), 20.1);
        });

        it("should return a float when passed a float encoded as a string", function() {
            assert.equal(dms_to_float("20.1"), 20.1);
        });

        it("should return a valid float when using a whole number of degrees", function() {
            chai.assert.closeTo(dms_to_float("24°", 90), 24, 0.1);
        });
        it("should return a valid float when using North", function() {
            chai.assert.closeTo(dms_to_float("24°28'N", 90), 24.466666, 0.1);
        });

        it("should return a valid float when using East", function() {
            chai.assert.closeTo(
                dms_to_float("54°22'E", 180.0),
                54.366666,
                0.00001
            );
        });

        it("should return a valid float when using South", function() {
            chai.assert.closeTo(
                dms_to_float("37°58'S", 90.0),
                -37.966666,
                0.00001
            );
        });

        it("should return a valid float when using West", function() {
            chai.assert.closeTo(
                dms_to_float("171°50'W", 180.0),
                -171.8333333,
                0.00001
            );
        });

        it("should return a valid float when using lower case directions", function() {
            chai.assert.closeTo(
                dms_to_float("171°50'w", 180.0),
                -171.8333333,
                0.00001
            );
        });

        it("should be clamped to a limit if one is provided", function() {
            assert.equal(dms_to_float("180°50'w", 180.0), -180);
        });
    });
});
