import { DateTime } from "luxon";
const rewire = require("rewire");
const expect = require("chai").expect;
const util = require("util");
const sun = rewire("../astral/sun");
const index = require("../astral/index");

let new_delhi = new index.LocationInfo(
    "New Delhi",
    "India",
    "Asia/Kolkata",
    28.61,
    77.22
);

describe("Test sun backend functions", function() {
    describe("julianday", function() {
        var tests = [
            { args: { year: 2012, month: 1, day: 1 }, expected: 2455927.5 },
            { args: { year: 2013, month: 1, day: 1 }, expected: 2456293.5 },
            { args: { year: 2013, month: 6, day: 1 }, expected: 2456444.5 },
            { args: { year: 1867, month: 2, day: 1 }, expected: 2402998.5 },
            { args: { year: 3200, month: 11, day: 14 }, expected: 2890153.5 }
        ];
        tests.forEach(function(test) {
            it(
                "calc the correct value for " + util.inspect(test.args),
                function() {
                    let res = sun.julianday(DateTime.fromObject(test.args));
                    expect(res).to.equal(test.expected);
                }
            );
        });
    });

    describe("jday_to_jcentury", function() {
        var tests = [
            { args: 2455927.5, expected: 0.119986311 },
            { args: 2456293.5, expected: 0.130006845 },
            { args: 2456444.5, expected: 0.134140999 },
            { args: 2402998.5, expected: -1.329130732 },
            { args: 2890153.5, expected: 12.00844627 }
        ];
        let func_to_test = sun.__get__("jday_to_jcentury");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                let res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("jcentury_to_jday", function() {
        var tests = [
            { args: 0.119986311, expected: 2455927.5 },
            { args: 0.130006845, expected: 2456293.5 },
            { args: 0.134140999, expected: 2456444.5 },
            { args: -1.329130732, expected: 2402998.5 },
            { args: 12.00844627, expected: 2890153.5 }
        ];
        let func_to_test = sun.__get__("jcentury_to_jday");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("geom_mean_long_sun", function() {
        var tests = [
            { args: -1.329130732, expected: 310.7374254 },
            { args: 12.00844627, expected: 233.8203529 },
            { args: 0.184134155, expected: 69.43779106 }
        ];
        let func_to_test = sun.__get__("geom_mean_long_sun");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("geom_mean_anomaly_sun", function() {
        var tests = [
            { args: 0.119986311, expected: 4676.922342 },
            { args: 12.00844627, expected: 432650.1681 },
            { args: 0.184134155, expected: 6986.1838 }
        ];
        let func_to_test = sun.__get__("geom_mean_anomaly_sun");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("eccentric_location_earth_orbit", function() {
        var tests = [
            { args: 0.119986311, expected: 0.016703588 },
            { args: 12.00844627, expected: 0.016185564 },
            { args: 0.184134155, expected: 0.016700889 }
        ];
        let func_to_test = sun.__get__("eccentric_location_earth_orbit");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("sun_eq_of_center", function() {
        var tests = [
            { args: 0.119986311, expected: -0.104951648 },
            { args: 12.00844627, expected: -1.753028843 },
            { args: 0.184134155, expected: 1.046852316 }
        ];
        let func_to_test = sun.__get__("sun_eq_of_center");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("sun_true_long", function() {
        var tests = [
            { args: 0.119986311, expected: 279.9610686 },
            { args: 12.00844627, expected: 232.0673358 },
            { args: 0.184134155, expected: 70.48465428 }
        ];
        let func_to_test = sun.__get__("sun_true_long");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("sun_true_anomoly", function() {
        var tests = [
            { args: 0.119986311, expected: 4676.817391 },
            { args: 12.00844627, expected: 432648.4151 },
            { args: 0.184134155, expected: 6987.230663 }
        ];
        let func_to_test = sun.__get__("sun_true_anomoly");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("sun_rad_vector", function() {
        var tests = [
            { args: 0.119986311, expected: 0.983322329 },
            { args: 12.00844627, expected: 0.994653382 },
            { args: 0.184134155, expected: 1.013961204 }
        ];
        let func_to_test = sun.__get__("sun_rad_vector");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("sun_apparent_long", function() {
        var tests = [
            { args: 0.119986311, expected: 279.95995849827 },
            { args: 12.00844627, expected: 232.065823531804 },
            { args: 0.184134155, expected: 70.475244256027 }
        ];
        let func_to_test = sun.__get__("sun_apparent_long");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("mean_obliquity_of_ecliptic", function() {
        var tests = [
            { args: 0.119986311, expected: 23.4377307876356 },
            { args: 12.00844627, expected: 23.2839797200388 },
            { args: 0.184134155, expected: 23.4368965974579 }
        ];
        let func_to_test = sun.__get__("mean_obliquity_of_ecliptic");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("obliquity_correction", function() {
        var tests = [
            { args: 0.119986311, expected: 23.4369810410121 },
            { args: 12.00844627, expected: 23.2852236361575 },
            { args: 0.184134155, expected: 23.4352890293474 }
        ];
        let func_to_test = sun.__get__("obliquity_correction");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("sun_rt_ascension", function() {
        var tests = [
            { args: 0.119986311, expected: -79.16480352 },
            { args: 12.00844627, expected: -130.3163904 },
            { args: 0.184134155, expected: 68.86915896 }
        ];
        let func_to_test = sun.__get__("sun_rt_ascension");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("sun_declination", function() {
        var tests = [
            { args: 0.119986311, expected: -23.06317068 },
            { args: 12.00844627, expected: -18.16694394 },
            { args: 0.184134155, expected: 22.01463552 }
        ];
        let func_to_test = sun.__get__("sun_declination");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("eq_of_time", function() {
        var tests = [
            { args: 0.119986311, expected: -3.078194825 },
            { args: 12.00844627, expected: 16.58348133 },
            { args: 0.184134155, expected: 2.232039737 }
        ];
        let func_to_test = sun.__get__("eq_of_time");
        tests.forEach(function(test) {
            it("calc the correct value for " + test.args, function() {
                var res = func_to_test(test.args);
                expect(res).to.be.closeTo(test.expected, 0.0001);
            });
        });
    });

    describe("hour_angle", function() {
        var tests = [
            { args: { year: 2012, month: 1, day: 1 }, expected: 1.03555238 },
            { args: { year: 3200, month: 11, day: 14 }, expected: 1.172253118 },
            { args: { year: 2018, month: 6, day: 1 }, expected: 2.133712555 }
        ];
        let func_to_test = sun.__get__("hour_angle");
        tests.forEach(function(test) {
            it(
                "calc the correct value for " + util.inspect(test.args),
                function() {
                    let jd = sun.julianday(DateTime.fromObject(test.args));
                    let jc = sun.__get__("jday_to_jcentury")(jd);
                    let decl = sun.__get__("sun_declination")(jc);
                    let res = func_to_test(
                        51.50853,
                        decl,
                        90.8333,
                        index.SunDirection.RISING
                    );
                    expect(res).to.be.closeTo(test.expected, 0.001);
                }
            );
        });
    });

    describe("azimuth", function() {
        it("calc the correct azimuth for New Delhi", function() {
            let dt = DateTime.fromObject({
                year: 2001,
                month: 6,
                day: 21,
                hour: 18,
                minute: 41,
                second: 0,
                zone: "Asia/Kolkata"
            });
            expect(sun.azimuth(new_delhi.observer, dt)).to.be.closeTo(
                292.766381632981,
                0.001
            );
        });

        it("calc the correct azimuth for a location above 85° latitude", function() {
            let dt = DateTime.fromObject({
                year: 2001,
                month: 6,
                day: 21,
                hour: 13,
                minute: 11,
                second: 0,
                zone: "UTC"
            });
            expect(sun.azimuth(new index.Observer(86, 77.2), dt)).to.be.closeTo(
                276.2148,
                0.001
            );
        });
    });

    describe("elevation", function() {
        it("calc the correct angle for New Delhi", function() {
            let dt = DateTime.fromObject({
                year: 2001,
                month: 6,
                day: 21,
                hour: 18,
                minute: 41,
                second: 0,
                zone: "Asia/Kolkata"
            });
            expect(sun.elevation(new_delhi.observer, dt)).to.be.closeTo(
                7.411009003716742,
                0.001
            );
        });

        it("calc the correct angle for a location above 85° latitude", function() {
            let dt = DateTime.fromObject({
                year: 2001,
                month: 6,
                day: 21,
                hour: 13,
                minute: 11,
                second: 0,
                zone: "UTC"
            });
            expect(sun.elevation(new index.Observer(86, 77.2), dt)).to.be.closeTo(
                23.102501151619506,
                0.001
            );
        });

        it("calc the correct angle for New Delhi when not adjusting for refraction", function() {
            let dt = DateTime.fromObject({
                year: 2001,
                month: 6,
                day: 21,
                hour: 18,
                minute: 41,
                second: 0,
                zone: "Asia/Kolkata"
            });
            expect(sun.elevation(new_delhi.observer, dt, false)).to.be.closeTo(
                7.293490557358638,
                0.001
            );
        });

        it("match the timeAtElevation calc", function() {
            var elevations = [1, 2, 3, 5, 10, 20, 30, 40, 50];
            elevations.forEach(function(el) {
                let dt = DateTime.fromObject({
                    year: 2020,
                    month: 6,
                    day: 6,
                    zone: "UTC"
                });

                let o = new index.Observer(51.50853, -0.12574);
                let et = sun.timeAtElevation(o, el, dt);

                expect(sun.elevation(o, et)).to.be.closeTo(el, 0.05);
            });
        });
    });
});
