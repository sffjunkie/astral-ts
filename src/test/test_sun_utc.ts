import { DateTime } from "luxon";
const rewire = require("rewire");
const expect = require("chai").expect;
const util = require("util");

import { Depression, Observer } from "../astral/index";
const sun = rewire("../astral/sun");

const london = new Observer(
    51.50853,
    -0.12574
);

const new_delhi = new Observer(
    28.61,
    77.22
);

describe("Sun UTC functions", function() {
    describe("sun", function() {
        var tests = [
            {
                args: { year: 2015, month: 12, day: 1 },
                expected: { year: 2015, month: 12, day: 1, hour: 7, minute: 4 }
            },
            {
                args: { year: 2015, month: 12, day: 2 },
                expected: { year: 2015, month: 12, day: 2, hour: 7, minute: 5 }
            },
            {
                args: { year: 2015, month: 12, day: 3 },
                expected: { year: 2015, month: 12, day: 3, hour: 7, minute: 6 }
            },
            {
                args: { year: 2015, month: 12, day: 12 },
                expected: { year: 2015, month: 12, day: 12, hour: 7, minute: 16 }
            },
            {
                args: { year: 2015, month: 12, day: 25 },
                expected: { year: 2015, month: 12, day: 25, hour: 7, minute: 25 }
            }
        ];
        tests.forEach(function(test) {
            it(
                "calc the correct value for " + util.inspect(test.args),
                function() {
                    let dt = DateTime.fromObject(test.args);
                    let td = dt.setZone("utc");
                    let res = sun.sun(london, dt).dawn;
                    let expected = DateTime.fromObject(test.expected);
                    expected = expected.setZone("UTC");
                    expect(res.toSeconds()).to.be.closeTo(expected.toSeconds(), 60);
                }
            );
        });
    });

    describe("civil dawn", function() {
        var tests = [
            {
                args: { year: 2015, month: 12, day: 1 },
                expected: { year: 2015, month: 12, day: 1, hour: 7, minute: 4 }
            },
            {
                args: { year: 2015, month: 12, day: 2 },
                expected: { year: 2015, month: 12, day: 2, hour: 7, minute: 5 }
            },
            {
                args: { year: 2015, month: 12, day: 3 },
                expected: { year: 2015, month: 12, day: 3, hour: 7, minute: 6 }
            },
            {
                args: { year: 2015, month: 12, day: 12 },
                expected: { year: 2015, month: 12, day: 12, hour: 7, minute: 16 }
            },
            {
                args: { year: 2015, month: 12, day: 25 },
                expected: { year: 2015, month: 12, day: 25, hour: 7, minute: 25 }
            }
        ];
        tests.forEach(function(test) {
            it(
                "calc the correct value for " + util.inspect(test.args),
                function() {
                    let dt = DateTime.fromObject(test.args);
                    let td = dt.setZone("utc");
                    let res = sun.dawn(london, dt, Depression.CIVIL);
                    let expected = DateTime.fromObject(test.expected);
                    expected = expected.setZone("UTC");
                    expect(res.toSeconds()).to.be.closeTo(expected.toSeconds(), 60);
                }
            );
        });
    });
    
    describe("nautical dawn", function() {
        var tests = [
            {
                args: { year: 2015, month: 12, day: 1 },
                expected: { year: 2015, month: 12, day: 1, hour: 6, minute: 22 }
            },
            {
                args: { year: 2015, month: 12, day: 2 },
                expected: { year: 2015, month: 12, day: 2, hour: 6, minute: 23 }
            },
            {
                args: { year: 2015, month: 12, day: 3 },
                expected: { year: 2015, month: 12, day: 3, hour: 6, minute: 24 }
            },
            {
                args: { year: 2015, month: 12, day: 12 },
                expected: { year: 2015, month: 12, day: 12, hour: 6, minute: 33 }
            },
            {
                args: { year: 2015, month: 12, day: 25 },
                expected: { year: 2015, month: 12, day: 25, hour: 6, minute: 41 }
            }
        ];
        tests.forEach(function(test) {
            it(
                "calc the correct value for " + util.inspect(test.args),
                function() {
                    let dt = DateTime.fromObject(test.args);
                    let td = dt.setZone("utc");
                    let res = sun.dawn(london, dt, Depression.NAUTICAL);
                    let expected = DateTime.fromObject(test.expected);
                    expected = expected.setZone("UTC");
                    expect(res.toSeconds()).to.be.closeTo(expected.toSeconds(), 60);
                }
            );
        });
    });
    
    describe("astronomical dawn", function() {
        var tests = [
            {
                args: { year: 2015, month: 12, day: 1 },
                expected: { year: 2015, month: 12, day: 1, hour: 5, minute: 41 }
            },
            {
                args: { year: 2015, month: 12, day: 2 },
                expected: { year: 2015, month: 12, day: 2, hour: 5, minute: 42 }
            },
            {
                args: { year: 2015, month: 12, day: 3 },
                expected: { year: 2015, month: 12, day: 3, hour: 5, minute: 44 }
            },
            {
                args: { year: 2015, month: 12, day: 12 },
                expected: { year: 2015, month: 12, day: 12, hour: 5, minute: 52 }
            },
            {
                args: { year: 2015, month: 12, day: 25 },
                expected: { year: 2015, month: 12, day: 25, hour: 6, minute: 1 }
            }
        ];
        tests.forEach(function(test) {
            it(
                "calc the correct value for " + util.inspect(test.args),
                function() {
                    let dt = DateTime.fromObject(test.args);
                    let td = dt.setZone("utc");
                    let res = sun.dawn(london, dt, Depression.ASTRONOMICAL);
                    let expected = DateTime.fromObject(test.expected);
                    expected = expected.setZone("UTC");
                    expect(res.toSeconds()).to.be.closeTo(expected.toSeconds(), 60);
                }
            );
        });
    });
});
